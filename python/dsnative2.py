#!/usr/bin/env python3
"""
DeepSeek thinking-mode + tool-call REPL PoC (requests)
Features:
- Uses requests to call DeepSeek-compatible Chat Completions endpoint
- Tools: execute_command -> client executes after user confirmation
- Special handling for 'cd' (changes python process cwd) with virtual root restriction
- System prompt includes detected shell (bash or cmd) and OS info
- Special CLI commands starting with '/': /i, /input, /exit, /save, /load, /chroot
- API key read from ./skapikey.txt (trimmed). fallback to env DEEPSEEK_API_KEY
"""
import os
import sys
import time
import json
import shlex
import subprocess
import requests
import platform
from pathlib import Path
from datetime import datetime
import ctypes
from ctypes import wintypes
from typing import Tuple, Optional

try:
    import readline # fix the input bug
except Exception:
    pass

# ========== Config ==========
BASE_URL = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com")  # 可按需修改
API_KEY_PATH = Path(os.environ.get("API_KEY_PATH", "/data/data/com.termux/files/home/skapikey.txt"))
EXEC_FILTER = os.environ.get('DSNATIVE2_EXEC_FILTER', None)
EXEC_RUNNER = os.environ.get('DSNATIVE2_EXEC_RUNNER', None)
DEFAULT_MODEL = os.environ.get('DSNATIVE2_DEFAULT_MODEL', "deepseek-v4-pro")
_current_model = DEFAULT_MODEL  # 可在运行时通过 /model 切换
TIMEOUT = 600
TIMING_ENABLED = False if (os.environ.get('DSNATIVE2_DISABLE_TIMING', None) == 'true') else True

class C:
    RESET = "\033[0m"
    DIM = "\033[90m"        # 淡灰（thinking / tool output）
    YELLOW = "\033[33m"     # tool call
    NORMAL = "\033[39m"     # 默认文本
    BOLD = "\033[1m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    DIM_RED = "\033[2;31m"  # 淡红（警告）

# ========== Read API Key ==========
def read_api_key():
    if API_KEY_PATH.exists():
        text = API_KEY_PATH.read_text(encoding="utf-8").strip()
        if text:
            return text
    # fallback
    envk = os.environ.get("DEEPSEEK_API_KEY") or os.environ.get("DEEPSEEK_KEY")
    if envk:
        os.environ.pop('DEEPSEEK_API_KEY', None)
        os.environ.pop('DEEPSEEK_KEY', None)
        return envk.strip()
    print("错误：未找到 API Key。请把 Key 放在 $API_KEY_PATH/skapikey.txt 或设置 DEEPSEEK_API_KEY 环境变量。")
    sys.exit(1)

API_KEY = read_api_key()

# ========== Detect shell & OS info ==========
IS_WINDOWS = os.name == "nt"
SHELL_TYPE = "cmd" if IS_WINDOWS else "bash"
OS_INFO = f"{platform.system()} {platform.release()} ({platform.machine()})"

# ========== Tools definition (sent to the model) ==========
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "execute_command",
            "description": "Request to execute a shell command. Use 'cd' to change directory.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "The shell command to run, e.g. 'ls -la'."
                    }
                },
                "required": ["command"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "change_dir",
            "description": "Change current directory. If you use normal 'cd foo && command', the new directory settings will not be able to persist because every tool call creates a new shell. Use 'change_dir' tool to persist current dir. Related path and complex path is supported, such as '../bar/foo'. Don't do meaningless thing such as two calls with '..' and 'foo': use '../foo' is ok. Critical note: The tool can only be called one by one. Never combine tool calls.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The new current dir."
                    }
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "edit_file",
            "description": "Edit or create a file. Types: 'create' (new file only, fails if exists, data required), 'overwrite' (replace entire content, file must exist), 'replace' (swap find→data), 'append'/'prepend' (insert around find). Use 'context' and 'count' to disambiguate matches.",
            "parameters": {
                "type": "object",
                "properties": {
                    "file": {
                        "type": "string",
                        "description": "Path to the file to edit (relative or absolute)."
                    },
                    "type": {
                        "type": "string",
                        "description": "Operation type: 'create' (create new file with data, fails if file exists), 'append' (insert data after find), 'prepend' (insert data before find), 'replace' (replace find with data), 'overwrite' (replace entire file content with data)."
                    },
                    "find": {
                        "type": "string",
                        "description": "The text pattern to find in the file. Required for append/prepend/replace. Not needed for create/overwrite."
                    },
                    "context": {
                        "type": "string",
                        "description": "Optional context string containing 'find' to narrow down ambiguous matches. When specified, first locate context matches, then apply the operation on 'find' within each context match."
                    },
                    "data": {
                        "type": "string",
                        "description": "The new value to insert/replace with."
                    },
                    "count": {
                        "type": "number",
                        "description": "Expected number of matches. Default is 1. If actual matches differ from this count, the operation fails with an error suggesting to use context or exact count."
                    }
                },
                "required": ["file", "type", "data"]
            }
        }
    }
]

# ========== Helpers ==========
def enable_vt_mode():
    """
    在 Windows 上启用虚拟终端模式
    """
    if not sys.platform.startswith('win'):
        # 如果不是 Windows 系统，直接返回
        return

    # 定义常量
    ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004

    # 获取标准输出句柄
    kernel32 = ctypes.windll.kernel32
    h_out = kernel32.GetStdHandle(-11)  # STD_OUTPUT_HANDLE
    
    # 获取当前控制台模式
    mode = wintypes.DWORD()
    kernel32.GetConsoleMode(h_out, ctypes.byref(mode))
    
    # 启用虚拟终端模式
    mode.value |= ENABLE_VIRTUAL_TERMINAL_PROCESSING
    kernel32.SetConsoleMode(h_out, mode)

def clear_reasoning_content(messages):
    return
    for m in messages:
        if isinstance(m, dict) and "reasoning_content" in m:
            m["reasoning_content"] = None
            
def run_command(command: str,
                stdin_input: Optional[str] = None,
                timeout: Optional[int] = None,
                cwd: Optional[str] = None) -> Tuple[int, str]:
    """
    执行命令并返回退出码和合并的输出

    Args:
        command: 要执行的命令字符串
        stdin_input: 作为子进程stdin输入的字符串，None表示不使用stdin
        timeout: 超时时间（秒），None表示不超时
        cwd: 工作目录，None表示当前目录

    Returns:
        Tuple[int, str]: (退出码, 合并的stdout+stderr 输出)

    Raises:
        FileNotFoundError: 命令不存在
        subprocess.TimeoutExpired: 命令执行超时
    """
    # 使用 shlex.split 安全地分割命令参数
    args = shlex.split(command)

    # 执行命令，将 stderr 合并到 stdout
    result = subprocess.run(
        args,
        input=stdin_input,        # 作为stdin输入
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,  # 关键：合并 stderr 到 stdout
        text=True,
        encoding='utf-8',
        errors='replace',         # 遇到编码错误时用替换字符
        timeout=timeout,
        cwd=cwd,
        check=False               # 不检查返回码，我们自己处理
    )

    return (result.returncode, result.stdout)

cd_err_cnt = 0
def handle_cd_command(command, cwd, virtual_root):
    """
    PoC 版 cd 解析：
    - 使用 shlex 分词
    - 只处理 cd <path>
    - 忽略 && 及之后的所有内容
    """
    global cd_err_cnt
    # try:
        # tokens = shlex.split(command, posix=not IS_WINDOWS)
    # except Exception as e:
        # return cwd, f"<cd parse error: {e}>"

    # if not tokens or tokens[0] != "cd":
        # return cwd, "<not a cd command>"

    # tokens: ["cd", "path", "&&", "something"...]
    # Update: due to the new tool, AI will specify the path directly
    # target = tokens[0] if len(tokens) >= 1 else os.path.expanduser("~")
    target = command

    # 构造目标路径
    target_path = Path(target)
    if not target_path.is_absolute():
        target_path = (cwd / target_path).resolve()
    else:
        target_path = target_path.resolve()

    # 虚拟 root 限制
    if not is_within_root(target_path, virtual_root):
        return cwd, f"<cd denied: {target_path} outside virtual root {virtual_root}>"

    # if len(tokens) > 2:
        # cd_err_cnt += 1
        # if cd_err_cnt >= 3:
            # raise Exception(f"FATAL: Agent access violation:: Due to security reason, cd command can only be invoked separately. The request has been blocked and the conversation has been interrupted due to {cd_err_cnt} violations.")
        # return Path.cwd(), f"FATAL: Due to security reason, cd command can only be invoked separately. The request has been blocked."
    try:
        os.chdir(target_path)
        new_cwd = Path.cwd()

        return new_cwd, f"<cd success, cwd= {new_cwd}>"
    except Exception as e:
        return cwd, f"<cd failed: {e}>"

def call_deepseek(messages):
    url = BASE_URL.rstrip("/") + "/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": _current_model,
        "messages": messages,
        "tools": TOOLS,
        "thinking": {"type": "enabled"}
    }
    r = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()

def stream_deepseek(messages):
    url = BASE_URL.rstrip("/") + "/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": _current_model,
        "messages": messages,
        "tools": TOOLS,
        "stream": True,
        "thinking": {"type": "enabled"},
    }

    try:
        with requests.post(url, headers=headers, json=payload, stream=True, timeout=TIMEOUT) as r:
            r.raise_for_status()
            for line in r.iter_lines(decode_unicode=True):
                if not line or not line.startswith("data:"):
                    continue
                data = line[len("data:"):].strip()
                if data == "[DONE]":
                    break
                yield json.loads(data)
    except KeyboardInterrupt:
        print(f"\n{C.RED}用户中断{C.RESET}")

def render_stream_chunk(chunk):
    delta = chunk["choices"][0].get("delta", {})
    
    if "reasoning_content" in delta and delta["reasoning_content"]:
        print(f"{C.DIM}{delta['reasoning_content']}{C.RESET}", end="", flush=True)

    if "content" in delta and delta["content"]:
        print(f"{C.NORMAL}{delta['content']}{C.RESET}", end="", flush=True)

    if "tool_calls" in delta:
        pass#print(f"\n{C.YELLOW}[tool_call]{json.dumps(delta['tool_calls'], ensure_ascii=False)}{C.RESET}")

def safe_norm_path(path_str):
    # normalize and return absolute Path
    p = Path(path_str).expanduser()
    return p.resolve()

def is_within_root(target_path, root_path):
    try:
        return root_path in target_path.parents or target_path == root_path
    except Exception:
        return False

current_truncate_val = 10000
def execute_subprocess(command, cwd):
    """
    Execute the command in a subprocess, capture stdout/stderr.
    - On Unix we will use bash -lc to allow typical shell syntax.
    - On Windows we let subprocess use shell=True (cmd.exe).
    - Streams output to console in real-time via threads.
    - Enforces a safety buffer limit (1M chars) to prevent OOM.
    """
    global current_truncate_val
    global EXEC_RUNNER
    import threading

    SAFETY_LIMIT = 1000000

    try:
        timingapidata = ""
        startTime = time.time()

        popen_kwargs = dict(
            shell=True, stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True, errors='replace', cwd=str(cwd)
        )
        if EXEC_RUNNER:
            popen_kwargs['executable'] = EXEC_RUNNER
        elif not IS_WINDOWS:
            popen_kwargs['executable'] = "/bin/bash"

        proc = subprocess.Popen(command, **popen_kwargs)

        # Shared state between reader threads
        state = {
            'out_parts': [],
            'err_parts': [],
            'out_collected': 0,
            'err_collected': 0,
            'out_total': 0,
            'err_total': 0,
            'lock': threading.Lock(),
        }

        def read_stream(stream, parts_key, collected_key, total_key):
            for line in iter(stream.readline, ''):
                print(line, end='', flush=True)
                with state['lock']:
                    state[total_key] += len(line)
                    collected = state[collected_key]
                    if collected < SAFETY_LIMIT:
                        room = SAFETY_LIMIT - collected
                        if len(line) <= room:
                            state[parts_key].append(line)
                            state[collected_key] = collected + len(line)
                        else:
                            state[parts_key].append(line[:room])
                            state[collected_key] = SAFETY_LIMIT
            stream.close()

        t1 = threading.Thread(target=read_stream,
            args=(proc.stdout, 'out_parts', 'out_collected', 'out_total'))
        t2 = threading.Thread(target=read_stream,
            args=(proc.stderr, 'err_parts', 'err_collected', 'err_total'))
        t1.start()
        t2.start()
        t1.join()
        t2.join()
        proc.wait()

        rc = proc.returncode

        out = "".join(state['out_parts'])
        err = "".join(state['err_parts'])

        combined = ""
        if out:
            combined += out
        if err:
            combined += ("\n[stderr]\n" + err)
        combined = combined.strip()
        if combined == "":
            combined = f"<no output> (returncode={rc})"

        # Compute total bytes read vs collected (for accurate truncation count)
        total_read = state['out_total'] + state['err_total']
        total_collected = state['out_collected'] + state['err_collected']
        internal_dropped = total_read - total_collected

        if len(combined) > current_truncate_val:
            truncated_amount = (len(combined) - current_truncate_val) + internal_dropped
            combined = combined[:current_truncate_val] + \
                f"[[TRUNCATED {truncated_amount} chars]]"

        if TIMING_ENABLED:
            timedata = {
                "elapsed": int(1000 * (time.time() - startTime)) / 1000,
                "current": {
                    "ts": int(time.time()),
                    "iso": datetime.now().isoformat()
                }
            }
            timingapidata = f"\nClient timing info: {json.dumps(timedata)}\n"
        if API_KEY in combined:
            combined = combined.replace(API_KEY, '<Sensitive API Key Detected>')
        return f"Return code: {rc}{timingapidata}\n{combined}"
    except Exception as e:
        return f"Error occurred while executing command: {e}"

# ========== Tool Handlers ==========

def tool_edit_file(args, cwd, virtual_root):
    """
    Edit a file with append/prepend/replace/overwrite operations.
    Returns result string.
    """
    file = args.get("file", "")
    op_type = args.get("type", "")
    find = args.get("find", None)
    context = args.get("context", None)
    data = args.get("data", "")
    count = args.get("count", 1)

    # Validate parameters
    if not file:
        return "<error: 'file' parameter is required>"
    if not op_type:
        return "<error: 'type' parameter is required>"
    if op_type not in ("create", "append", "prepend", "replace", "overwrite"):
        return f"<error: invalid type '{op_type}', must be one of: create, append, prepend, replace, overwrite>"
    if op_type not in ("overwrite", "create") and not find:
        return f"<error: 'find' parameter is required for type '{op_type}'>"
    if not isinstance(data, str):
        return "<error: 'data' must be a string>"
    if not isinstance(count, int) or count < 1:
        return "<error: 'count' must be a positive integer>"

    # Resolve file path
    file_path = Path(file)
    if not file_path.is_absolute():
        file_path = (cwd / file_path).resolve()
    else:
        file_path = file_path.resolve()

    # Check virtual root
    if not is_within_root(file_path, virtual_root):
        return f"<edit_file denied: {file_path} is outside virtual root {virtual_root}>"

    # Create: only for new files
    if op_type == "create":
        if file_path.exists():
            return f"<error: file '{file_path}' already exists (use 'overwrite' to replace existing files)>"
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(data, encoding='utf-8')
            return f"<file created: {file_path} ({len(data)} chars)>"
        except Exception as e:
            return f"<error: cannot create file '{file_path}': {e}>"

    if not file_path.exists():
        return f"<error: file '{file_path}' does not exist>"

    if not file_path.is_file():
        return f"<error: '{file_path}' is not a file>"

    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return f"<error: cannot read file '{file_path}': {e}>"

    # Overwrite: replace entire file content
    if op_type == "overwrite":
        try:
            file_path.write_text(data, encoding='utf-8')
            return f"<file overwritten: {file_path}>"
        except Exception as e:
            return f"<error: cannot write file '{file_path}': {e}>"

    # For append/prepend/replace, find matches and apply
    if context:
        # Use context to narrow down matches
        context_count = content.count(context)
        if context_count == 0:
            return f"<error: context pattern not found in file>"
        if context_count != count:
            return (
                f"Error: Ambiguous edit operation. Details:\n"
                f"Context pattern has {context_count} matches. "
                f"Please use a more precise context argument to narrow down the match. "
                f"If you believe that all {context_count} matches should be updated, "
                f"please specify count: {context_count}."
            )

        # Within each context match, find 'find' and apply operation
        result_parts = []
        last_end = 0
        search_start = 0
        while True:
            idx = content.find(context, search_start)
            if idx == -1:
                break
            result_parts.append(content[last_end:idx])
            ctx_text = content[idx:idx + len(context)]

            # Find 'find' within this context occurrence (first match only)
            find_idx = ctx_text.find(find)
            if find_idx == -1:
                return f"<error: find pattern not found within context at position {idx}>"

            if op_type == "replace":
                new_ctx = ctx_text[:find_idx] + data + ctx_text[find_idx + len(find):]
            elif op_type == "append":
                new_ctx = ctx_text[:find_idx + len(find)] + data + ctx_text[find_idx + len(find):]
            elif op_type == "prepend":
                new_ctx = ctx_text[:find_idx] + data + ctx_text[find_idx:]

            result_parts.append(new_ctx)
            last_end = idx + len(context)
            search_start = last_end

        result_parts.append(content[last_end:])
        new_content = "".join(result_parts)
    else:
        # Direct find (no context)
        find_count = content.count(find)
        if find_count == 0:
            return f"<error: find pattern not found in file>"
        if find_count != count:
            return (
                f"Error: Ambiguous edit operation. Details:\n"
                f"Find pattern has {find_count} matches. "
                f"Please use context argument to specify the context. "
                f"If you believe that all the matches should be updated, "
                f"please specify the exact count (currently {count}, actual {find_count})."
            )

        result_parts = []
        last_end = 0
        search_start = 0
        while True:
            idx = content.find(find, search_start)
            if idx == -1:
                break
            result_parts.append(content[last_end:idx])

            if op_type == "replace":
                result_parts.append(data)
            elif op_type == "append":
                result_parts.append(content[idx:idx + len(find)] + data)
            elif op_type == "prepend":
                result_parts.append(data + content[idx:idx + len(find)])

            last_end = idx + len(find)
            search_start = last_end

        result_parts.append(content[last_end:])
        new_content = "".join(result_parts)

    try:
        file_path.write_text(new_content, encoding='utf-8')
        return f"<file edited: {file_path}, type={op_type}, matches={count}>"
    except Exception as e:
        return f"<error: cannot write file '{file_path}': {e}>"


def tool_execute_command(args, cwd, sub_action):
    """
    Execute a shell command. Handles special sub_actions: e (edit), r (raw).
    For 't' (truncate), the global current_truncate_val is already updated by caller.
    For 'y', executes normally.
    Returns result string.
    """
    command = args.get("command", "")
    result = ""

    if sub_action == 'e':
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.sh', delete=True) as tmp:
            tmp.write(command)
            tmp.flush()
            os.fsync(tmp.fileno())
            subprocess.run(['vim', tmp.name])
            tmp.seek(0)
            command = tmp.read()
        result = f"<user edited the command>\nNew command is as follows:\n{command}\n\n---\n"
    elif sub_action == 'r':
        if "old" in args:
            command = args.pop("old")

    result += execute_subprocess(command, cwd)
    return result


# Tool display names for user prompts
TOOL_DISPLAY = {
    "execute_command": "执行命令",
    "change_dir": "切换目录",
    "edit_file": "编辑文件",
}

# Approval prompts per tool
TOOL_APPROVAL_PROMPTS = {
    "execute_command": "是否执行该命令？ (y:执行 / n:不执行 / s:跳过并返回空结果 / t:调整截断大小并执行 / e:编辑并执行 / r:跳过过滤器并执行)",
    "change_dir": "是否切换目录？ (y:切换 / n:不切换 / s:跳过并返回空结果)",
    "edit_file": "是否编辑该文件？ (y:编辑 / n:不编辑 / s:跳过并返回空结果)",
}

# Valid yes-like actions per tool
TOOL_YES_ACTIONS = {
    "execute_command": ("y", "t", "e", "r"),
    "change_dir": ("y", "t", "e", "r"),
    "edit_file": ("y",),
}


def parse_tool_args(tool):
    """Parse tool call arguments. Returns (func_name, args_dict)."""
    func_name = tool.get("function", {}).get("name")
    args_raw = tool.get("function", {}).get("arguments", "{}")
    try:
        args = json.loads(args_raw)
    except Exception:
        if func_name == "edit_file":
            print(f"{C.DIM_RED}[警告] edit_file 参数 JSON 解析失败，原始内容如下:\n"
                  f"{args_raw}\n--- 警告结束 ---{C.RESET}")
        args = {"command": args_raw}
    return func_name, args


def format_edit_desc(args):
    """Format a user-friendly edit_file description with color-coded changes."""
    file = args.get('file', '?')
    op = args.get('type', '?')
    find = args.get('find', '')
    ctx = args.get('context', '')
    data = args.get('data', '')
    count = args.get('count', 1)

    meta = []
    if ctx:
        meta.append(f"context: {ctx}")
    if count > 1:
        meta.append(f"count: {count}")
    meta_str = " (" + ", ".join(meta) + ")" if meta else ""

    R = C.RED
    G = C.GREEN
    X = C.RESET
    Y = C.YELLOW

    if op == 'create':
        return f"创建新文件 {file}（{len(data)} 字符）:\n{G}{data}{X}"
    elif op == 'overwrite':
        return f"覆盖写入 {file}（{len(data)} 字符）:\n{G}{data}{X}"
    elif op == 'replace':
        return (f"在 {file} 中 替换{meta_str}:\n"
                f"--- 原文本 ---\n{R}{find}{X}\n"
                f"--- 新文本 ---\n{G}{data}{X}")
    elif op == 'append':
        return (f"在 {file} 中{meta_str}，在:\n"
                f"{Y}{find}{X}\n"
                f"之后 插入:\n{G}{data}{X}")
    elif op == 'prepend':
        return (f"在 {file} 中{meta_str}，在:\n"
                f"{Y}{find}{X}\n"
                f"之前 插入:\n{G}{data}{X}")
    return f"编辑 {file}: {op}"



def get_tool_approval(func_name):
    """Ask user for approval. Returns (action_key, custom_message_or_None)."""
    prompt = TOOL_APPROVAL_PROMPTS.get(
        func_name,
        "是否执行？ (y:是 / n:否 / s:跳过)"
    )
    yn = input(prompt + " ").strip()
    yn_lower = yn.lower()

    yes_set = TOOL_YES_ACTIONS.get(func_name, ("y",))

    if yn_lower == 'n':
        return 'n', None
    elif yn_lower == 's':
        return 's', None
    elif yn_lower in yes_set:
        return yn_lower, None
    else:
        print("将把自定义消息传递给模型。")
        return 'custom', yn


# ========== REPL / Agent logic ==========
def build_system_message(root_dir):
    return {
        "role": "system",
        "content": (
            "## System environment"
            "\nYou are an assistant that can request execution of shell commands via a tool call named \"execute_command\", and edit files via \"edit_file\". Only request the tool when you *need* to run commands or modify files. "
            f"\nThe user's OS: {OS_INFO}. The shell available is '{SHELL_TYPE}'."
            "\nImportant: The client's agent "
            "enforces a virtual root (sandbox) and will deny cd outside that root. The agent will **ALWAYS** ask "
            "the human user for confirmation before executing any requested command. If you want to provide "
            "multi-step plans, consider describing them first.\nIf you wants to change directory to complete a task, **ALWAYS** consider 'change_dir' tool first. Use 'cd foo && command' syntax **ONLY when the command is very simple**."
            "\n\n## Command execution rule"
            "\n- **Do one thing at one time**. Every command will be reviewed by user before being executed. Avoid combining **complex** commands."
            "\n- **Merge on demand**. Shell provides syntax to run multiple command at one time, such as '&&' '||' and ';'. Though it is required to split complex commands, merging some simple commands is allowed. For example, you shouldn't run \"cd foo && curl -o xxxx && sh -c xxx\" at one time; running \"cd bar && npm install && npm run build\" is allowed."
            "\n- **Avoid unnecessary split**. It is obvious that every tool calls creates a new execution context and a new API call, so you shouldn't split simple commands. For example, 'pwd && ls' **should** be executed together. If you split them into two tool calls, not only it's unnecessary but also it increases the response time. So don't split simple commands like this."
            "\n- **Know the environment**. The command is executed in a subshell; every request is standalone. This means that environment variables and current directory will not be persisted (for current directory, use 'change_dir' to persist change). The agent captures stdout and stderr. If you directly write to /dev/tty or anything like this, output will not be recorded. Output is also visible to the user (after the command finishes)."
            "\n- **Know the shell**. The sub shell is **NOT** interactive. If a subprocess wants user input, it will stuck the client. So do not run interactive commands or programs. Besides, the conversation will NOT continue until the command finishes."
            "\n- **Manage the context wisely**. The context window will not be cleared in the current wrapper script, meaning that you should manage the context wisely. Put it into practice, you should ensure that the command output is not too long. The client also truncate any output that is longer than a specified value. If there is a genuine need to read long texts, fot example, when the user asks you to analyze novels, consider ask the user to expand the auto-truncate threshold."
            "\n\n## Change current directory rule"
            "\n- **Use when necessary**. If you just want to check directory content, use 'cd xxx && ls' or simply use 'ls xxx' is a better choice. However, if it is required to finish complex task, e.g. search text, edit file, etc, use 'change_dir' instead of 'cd dir && command'."
            "\n- **Never do useless things**. When changing directory, never split a simple operation. For example, if you want to change dir to '../foo/bar', do not call 'change_dir(..)', 'change_dir(foo)', then 'change_dir(bar)'. One call is enough: 'change_dir(../foo/bar)'."
            "\n\n## File editing rule"
            "\n- **MUST Use edit_file insteadof sed for file editing**. The 'edit_file' tool provides structured file editing with append/prepend/replace/overwrite operations. FORBIDDEN using shell commands like 'sed', 'echo >' etc, for file modifications when edit_file can do the job."
            "\n- **Operation types**: 'create' creates a new file (fails if file already exists, no find needed); 'overwrite' replaces entire file content (file must exist, no find needed); 'replace' substitutes find with data; 'append' inserts data after find; 'prepend' inserts data before find."
            "\n- **Provide precise find strings**. The 'find' parameter must match exact file content. If ambiguous, use 'context' to narrow down, or specify exact 'count' to update all matches."
            "\n- **Context narrows matches**. When 'context' is provided, the tool first locates context matches, then applies the operation on 'find' within each context match."
            "\n- **Count must match exactly**. If you specify count: N, the file must have exactly N matches. If counts don't match, the operation fails. Default count is 1."
            "\n- **All edits require user approval**. Every edit_file call will be confirmed by the user before execution."
            "\n\nCommunication and interact rule"
            "\n- **Respect user privacy**. If the user does not want you to view or check something, respect user's choice. Do not try to use non-standard methods to avoid the limitation."
            "\n- **Honestly explain your limitations**. If the user expressed intention, wanting you to check what is outside the virtual filesystem, explain that you can't do it and recommend the user to start a new conversation in that directory. Do not try to avoid system limitations."
            "\n- **Do what you can**. If the user wants to complete a very difficult task or a task that couldn't be completed in the current environment, explain your capabilities and limitations and tell the user the current situation and why you couldn't finish the task. Never stick on a difficult problem for a long time."
        )
    }

def load_messages_from_file(filename, current_virtual_root):
    """
    从文件加载对话历史，并重建系统消息（移除所有旧的系统消息）。
    返回加载后的消息列表（包含新的系统消息）。
    """
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            loaded = json.load(f)
        if not isinstance(loaded, list):
            print(f"错误：{filename} 不是有效的 JSON 数组")
            return None
        # 移除所有已有的系统消息
        filtered = [msg for msg in loaded if msg.get("role") != "system"]
        # 插入新的系统消息
        filtered.insert(0, build_system_message(str(current_virtual_root)))
        return filtered
    except Exception as e:
        print(f"加载 {filename} 失败: {e}")
        return None

def save_messages_to_file(messages, filename):
    """保存消息列表到文件，自动处理异常"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(messages, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"保存到 {filename} 失败: {e}")
        return False

def repl(session_path=None, load_path=None):
    # initial state
    start_dir = Path.cwd().resolve()
    virtual_root = start_dir  # initial virtual root is current working directory
    cwd = start_dir
    global current_truncate_val
    global EXEC_FILTER
    
    session_save_path = session_path   # 可能为 None
    load_only_path = load_path
    
    # 初始化消息列表（先创建一个临时系统消息，稍后可能被替换）
    messages = [build_system_message(str(virtual_root))]
    
    # 加载逻辑（优先级：load_only_path > session_save_path）
    loaded_from = None
    if load_only_path and os.path.exists(load_only_path):
        loaded = load_messages_from_file(load_only_path, virtual_root)
        if loaded is not None:
            messages = loaded
            loaded_from = load_only_path
            print(f"已从 {load_only_path} 加载会话")
    elif session_save_path and os.path.exists(session_save_path):
        loaded = load_messages_from_file(session_save_path, virtual_root)
        if loaded is not None:
            messages = loaded
            loaded_from = session_save_path
            print(f"已从 {session_save_path} 加载会话")
    
    print("DeepSeek Agent REPL (PoC).")
    print(f"Working dir: {cwd}")
    print("Special commands: /i, /input, /exit, /save [FILENAME] [-f], /load FILENAME, /saveas NEWPATH, /chroot [NEWROOT], /model [MODEL|\"pro\"|\"flash\"]")
    print("每次模型请求执行命令前，客户端会要求人工确认。仅用于测试。")
    if EXEC_FILTER:
        print('将使用以下过滤器以过滤命令:', EXEC_FILTER)
    if EXEC_RUNNER:
        print('将使用以下解释器以运行命令:', EXEC_RUNNER)
    print("-----\n")

    turn = 1
    while True:
        try:
            raw = input(f"\033[0;32m{cwd}\033[0m \033[0;97m$\033[0m ")
        except EOFError:
            print("\nEOF received. Exiting.")
            break
        except KeyboardInterrupt:
            print("\n^C received. Exiting.")
            break

        raw = raw.rstrip("\n")
        # Special commands start with '/'
        if raw.startswith("/"):
            parts = raw.split(" ", 1)
            cmd = parts[0].lower()
            arg = parts[1] if len(parts) > 1 else ""

            if cmd in ("/i", "/input"):
                # If user provided text inline (/i hello), send it as user message.
                if arg:
                    user_text = arg
                else:
                    # multiline mode until EOF (Ctrl-D)
                    print("Enter multi-line input. End with Ctrl-D (EOF) on a new line.")
                    multiline = []
                    try:
                        while True:
                            line = input()
                            multiline.append(line)
                    except EOFError:
                        pass
                    user_text = "\n".join(multiline)
                messages.append({"role": "user", "content": user_text})
                # proceed to call model below
            elif cmd == "/exit":
                if session_save_path:
                    # 自动保存到预设路径
                    if save_messages_to_file(messages, session_save_path):
                        print(f"会话已自动保存到 {session_save_path}")
                    print("Bye.")
                    break
                else:
                    # 原交互：询问是否保存
                    print("退出，是否保存对话？ y/n", end=' ', flush=True)
                    ans = input().strip().lower()
                    if ans == "y":
                        save_path = input("保存到文件（回车为默认）: ").strip()
                        if not save_path:
                            save_path = "/sdcard/" + (datetime.now().strftime("%Y%m%dT%H%M%S")) + '.json'
                        if save_messages_to_file(messages, save_path):
                            print(f"已保存到 {save_path}")
                    print("Bye.")
                    break
            elif cmd == "/save":
                tokens = arg.split()
                filename = tokens[0] if tokens else ""
                force = False
                if "-f" in tokens:
                    force = True
                if not filename:
                    filename = input("请输入保存文件名: ").strip()
                if os.path.exists(filename) and not force:
                    yn = input(f"文件 {filename} 已存在，是否覆盖？ (y/n) ").strip().lower()
                    if yn != "y":
                        print("取消保存。")
                        continue
                if save_messages_to_file(messages, filename):
                    print(f"会话已保存到 {filename}")
                continue
            elif cmd == "/saveas":
                # 用法：/saveas [新路径]
                new_path = arg.strip()
                if not new_path:
                    print("用法：/saveas 新路径")
                    continue
                # 更新保存路径
                session_save_path = new_path
                # 立即保存
                if save_messages_to_file(messages, session_save_path):
                    print(f"会话已保存到 {session_save_path}")
                continue
            elif cmd == "/load":
                if not arg:
                    print("用法: /load FILENAME")
                    continue
                filename = arg.strip()
                if not os.path.exists(filename):
                    print(f"文件 {filename} 不存在。")
                    continue
                loaded = load_messages_from_file(filename, virtual_root)
                if loaded is not None:
                    messages = loaded
                    print(f"已从 {filename} 加载会话")
                continue
            elif cmd == "/chroot":
                newroot = arg.strip()
                if not newroot:
                    print("用法: /chroot NEWROOT (路径相对于当前工作目录或绝对路径)")
                    continue
                newroot_path = safe_norm_path(newroot)
                if not newroot_path.exists() or not newroot_path.is_dir():
                    print(f"路径 {newroot_path} 不存在或不是目录")
                    continue
                virtual_root = newroot_path
                # if current cwd is outside new root, set cwd to new root
                if not is_within_root(cwd.resolve(), virtual_root):
                    cwd = virtual_root
                    os.chdir(str(cwd))
                # update system prompt
                messages[0] = build_system_message(str(virtual_root))
                print(f"已设置虚拟根：{virtual_root}")
                continue
            elif cmd == "/model":
                global _current_model
                if not arg:
                    print(f"当前模型: {_current_model}")
                else:
                    newVal = arg.strip()
                    if newVal == 'pro':
                        _current_model = 'deepseek-v4-pro'
                    elif newVal == 'flash':
                        _current_model = 'deepseek-v4-flash'
                    else:
                        _current_model = newVal
                    print(f"已切换模型为: {_current_model}")
                continue
            else:
                print("未知特殊命令。支持: /i, /input, /exit, /save, /saveas, /load, /chroot, /model")
                continue
        else:
            # Normal user input: send as user message
            messages.append({"role": "user", "content": raw})

        # ---- call model in a loop supporting thinking + tool calls (STREAM VERSION) ----
        # 记录当前的messages.length
        sub_turn = 1
        while True:
            print(f"\n--- Model Turn {turn}.{sub_turn} ---")
        
            collected_message = {
                "role": "assistant",
                "content": "",
                "reasoning_content": "",
                "tool_calls": None,
            }
            tool_call_buffer = {}
        
            try:
                for chunk in stream_deepseek(messages):
                    try:
                        render_stream_chunk(chunk)
                    except KeyboardInterrupt:
                        print(f"\n{C.RED}用户中断{C.RESET}")
        
                    delta = chunk["choices"][0].get("delta", None)
                    if not delta:
                        continue
                        raise Exception('无效响应: ' + json.dumps(chunk))
        
                    # 收集 reasoning_content
                    if "reasoning_content" in delta and delta["reasoning_content"]:
                        if not delta["reasoning_content"]:
                            raise Exception('无效响应: ' + json.dumps(chunk))
                        collected_message["reasoning_content"] += delta["reasoning_content"]
        
                    # 收集普通输出
                    if "content" in delta and delta["content"]:
                        if not delta["content"]:
                            raise Exception('无效响应: ' + json.dumps(chunk))
                        collected_message["content"] += delta["content"]
        
                    if "tool_calls" in delta:
                        try:
                            for tc in delta["tool_calls"]:
                                idx = tc["index"]
                        
                                entry = tool_call_buffer.setdefault(idx, {
                                    "id": None,
                                    "type": "function",
                                    "function": {
                                        "name": None,
                                        "arguments": ""
                                    }
                                })
                        
                                if "id" in tc:
                                    entry["id"] = tc["id"]
                        
                                if "function" in tc:
                                    fn = tc["function"]
                                    try:
                                        if "name" in fn:
                                            entry["function"]["name"] = fn["name"]
                                        if "arguments" in fn:
                                            entry["function"]["arguments"] += fn["arguments"]
                                    except Exception as e:
                                        print(f"\n工具调用解析异常 {e} entry是：{json.dumps(entry)}")
                                        continue
                        except Exception as e:
                            print(f"\n工具调用异常")
                            import traceback
                            traceback.print_exc()
                            continue

            except BaseException as e:
                print(f"\n[ERROR] 调用 DeepSeek 接口失败")
                import traceback
                traceback.print_exc()
                break
        
            print("\n-------------------------\n")
            
            tool_calls = list(tool_call_buffer.values()) or None
            
            if tool_calls and EXEC_FILTER:
                for i, tool_call in enumerate(tool_calls):
                    function_info = tool_call.get('function', {})
                    if function_info and function_info.get('name', '') == 'execute_command':
                        try:
                            args = json.loads(function_info.get('arguments', '{}'))
                        except:
                            continue
                        if args and "command" in args:
                            try:
                                stat, filtered = run_command(EXEC_FILTER, args["command"])
                                if stat != 0:
                                    raise Exception('过滤器返回了', stat, filtered)
                                if filtered != args["command"]:
                                    args["old"] = args["command"]
                                args["command"] = filtered
                                tool_calls[i]["function"]["arguments"] = json.dumps(args)
                            except Exception as e:
                                print('错误: 无法运行过滤器')
                                import traceback
                                traceback.print_exc()
                                args["command"] = 'exit 1 && SYSTEM ERROR: User filter failed: ' + str(e)
                                tool_calls[i]["function"]["arguments"] = json.dumps(args)

            # 如果有工具调用，并且 reasoning_content 为空但 content 不为空，把 content 当作 reasoning_content
            #if (tool_calls is not None) and (collected_message.get("reasoning_content") == "") and not (collected_message.get("content") == ""):
            #    collected_message["reasoning_content"], collected_message["content"] = collected_message["content"], ""

            # 追加 assistant 消息（让模型能在下一轮继续）
            messages.append({
                "role": "assistant",
                "reasoning_content": collected_message["reasoning_content"]
                   if collected_message["reasoning_content"] else "",
                "content": collected_message["content"]
                   if collected_message["content"] else "",
                **({ "tool_calls": tool_calls }
                   if tool_calls else {}),
            })
            # 如果指定了 session 文件，每次助手回复后自动保存
            if session_save_path:
                save_messages_to_file(messages, session_save_path)
                
            if not tool_calls:
                # 没有工具调用，说明是最终回答
                break
            
            # ---- process each tool call ----
            has_excep = False
            total_tools = len(tool_calls)

            if total_tools > 1:
                print(f"\n{C.YELLOW}模型想要执行多个操作！{C.RESET}")

            for i, tool in enumerate(tool_calls):
                try:
                    func_name, args = parse_tool_args(tool)

                    # Display intent (with [i/total] prefix for multi-tool)
                    progress = f"[{i+1}/{total_tools}] " if total_tools > 1 else ""
                    if func_name == "edit_file":
                        print(f"{C.YELLOW}\n{progress}模型请求{format_edit_desc(args)}{C.RESET}\n")
                    else:
                        val = args.get("command", args.get("path", ""))
                        label = TOOL_DISPLAY.get(func_name, func_name)
                        print(f"{C.YELLOW}\n{progress}模型请求{label}:\n>>> {val}{C.RESET}\n")

                    # Get user approval
                    action, custom_msg = get_tool_approval(func_name)

                    if action == 'n':
                        result_str = "<user rejected execution>"
                        print("已拒绝执行。将返回拒绝结果给模型。")

                    elif action == 's':
                        result_str = "<skipped by user>"
                        print("已跳过（返回跳过标记）")

                    elif action == 'custom':
                        result_str = f"<user rejected execution and replied>\n{custom_msg}"

                    else:
                        # Execute approved tool
                        try:
                            if func_name == "execute_command":
                                if action == 't':
                                    global current_truncate_val
                                    current_truncate_val = int(input(
                                        f"当前截断大小：{current_truncate_val}，请输入新的截断大小（务必需要是数字）: "))
                                result_str = tool_execute_command(args, cwd, action)
                                MAX_CHARS = 1000000
                                if len(result_str) > MAX_CHARS:
                                    result_str = result_str[:MAX_CHARS] + "\n...[truncated]"
                                print(f"{C.DIM}命令执行返回（前{current_truncate_val+200}字符）:"
                                      f"\n{result_str[:current_truncate_val+200]}{C.RESET}\n")

                            elif func_name == "change_dir":
                                cwd, result_str = handle_cd_command(
                                    args.get("path", ""), cwd, virtual_root)
                                print(f"{C.DIM}{result_str}{C.RESET}")

                            elif func_name == "edit_file":
                                result_str = tool_edit_file(args, cwd, virtual_root)
                                print(f"{C.DIM}{result_str}{C.RESET}")

                            else:
                                result_str = f"<error: unknown tool '{func_name}'>"

                        except Exception as e:
                            result_str = f"<exec failed: {e}>"

                except Exception as e:
                    has_excep = True
                    result_str = f"Unexpected exception during executing command: {e}"
                    print(result_str)

                # Append tool result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool.get("id"),
                    "content": result_str,
                })
        
            if has_excep:
                break
            sub_turn += 1
        # # 清理推理内容
        # for msg in messages:
           # if msg.get("role") == "assistant" and "reasoning_content" in msg:
               # msg["reasoning_content"] = None
        turn += 1
        # Loop back to read next user input

if __name__ == "__main__":
    enable_vt_mode()
    
    import argparse
    parser = argparse.ArgumentParser(description='DeepSeek Agent REPL')
    parser.add_argument('-s', '--session', metavar='FILE', help='Set the session file location (an association will be established)')
    parser.add_argument('-l', '--load', '--load-from', dest='load_from', metavar='FILE', help='Load conversation history from the specified file (no association will be established after the content was loaded)')
    args = parser.parse_args()
    
    repl(session_path=args.session, load_path=args.load_from)
