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
import json
import shlex
import subprocess
import requests
import platform
from pathlib import Path
from datetime import datetime
import ctypes
from ctypes import wintypes

try:
    import readline # fix the input bug
except Exception:
    pass

# ========== Config ==========
BASE_URL = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com")  # 可按需修改
API_KEY_PATH = Path(os.environ.get("API_KEY_PATH", "/data/data/com.termux/files/home/skapikey.txt"))
DEFAULT_MODEL = "deepseek-reasoner"  # 替换为你要用的模型标识
TIMEOUT = 60

class C:
    RESET = "\033[0m"
    DIM = "\033[90m"        # 淡灰（thinking / tool output）
    YELLOW = "\033[33m"     # tool call
    NORMAL = "\033[39m"     # 默认文本
    BOLD = "\033[1m"
    RED = "\033[31m"

# ========== Read API Key ==========
def read_api_key():
    if API_KEY_PATH.exists():
        text = API_KEY_PATH.read_text(encoding="utf-8").strip()
        if text:
            return text
    # fallback
    envk = os.environ.get("DEEPSEEK_API_KEY") or os.environ.get("DEEPSEEK_KEY")
    if envk:
        return envk.strip()
    print("错误：未找到 API Key。请把 Key 放在 ./skapikey.txt 或设置 DEEPSEEK_API_KEY 环境变量。")
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
                        "description": "The shell command to run, e.g. 'ls -la' or 'cd /path'."
                    }
                },
                "required": ["command"]
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

def handle_cd_command(command, cwd, virtual_root):
    """
    PoC 版 cd 解析：
    - 使用 shlex 分词
    - 只处理 cd <path>
    - 忽略 && 及之后的所有内容
    """
    try:
        tokens = shlex.split(command, posix=not IS_WINDOWS)
    except Exception as e:
        return cwd, f"<cd parse error: {e}>"

    if not tokens or tokens[0] != "cd":
        return cwd, "<not a cd command>"

    # tokens: ["cd", "path", "&&", "something"...]
    target = tokens[1] if len(tokens) >= 2 else os.path.expanduser("~")

    # 构造目标路径
    target_path = Path(target)
    if not target_path.is_absolute():
        target_path = (cwd / target_path).resolve()
    else:
        target_path = target_path.resolve()

    # 虚拟 root 限制
    if not is_within_root(target_path, virtual_root):
        return cwd, f"<cd denied: {target_path} outside virtual root {virtual_root}>"

    try:
        os.chdir(target_path)
        new_cwd = Path.cwd()
        if len(tokens) > 2:
            return new_cwd, f"<cd success, cwd= {new_cwd}>\nWarning: Due to security reason, cd command can only be invoked separately. If 'cd path && other_cmd' is provided, other_cmd will be ignored. 'cd x && cd y' will only cd x. However, cd x/y or cd ../y is allowed."
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
        "model": DEFAULT_MODEL,
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
        "model": DEFAULT_MODEL,
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

def execute_subprocess(command, cwd):
    """
    Execute the command in a subprocess, capture stdout/stderr.
    - On Unix we will use bash -lc to allow typical shell syntax.
    - On Windows we let subprocess use shell=True (cmd.exe).
    """
    try:
        if IS_WINDOWS:
            # Windows: shell via cmd.exe
            proc = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=str(cwd))
        else:
            # Unix: use bash -lc for better POSIX compatibility
            proc = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=str(cwd), executable="/bin/bash")
        out = proc.stdout or ""
        err = proc.stderr or ""
        rc = proc.returncode
        combined = ""
        if out:
            combined += out
        if err:
            combined += ("\n[stderr]\n" + err)
        combined = combined.strip()
        if combined == "":
            combined = f"<no output> (returncode={rc})"
        return f"Return code: {rc}\n{combined}"
    except Exception as e:
        return f"Error occurred while executing command: {e}"

# ========== REPL / Agent logic ==========
def build_system_message(root_dir):
    return {
        "role": "system",
        "content": (
            "You are an assistant that can request execution of shell commands via a tool call named "
            "\"execute_command\". Only request the tool when you *need* to run commands. "
            f"The user's OS: {OS_INFO}. The shell available is '{SHELL_TYPE}'.\n\n"
            "Important: when you ask to change directory use 'cd <path>' syntax. The client's agent "
            "enforces a virtual root (sandbox) and will deny cd outside that root. The agent will ALWAYS ask "
            "the human user for confirmation before executing any requested command. If you want to provide "
            "multi-step plans, consider describing them first."
        )
    }

def repl():
    # initial state
    start_dir = Path.cwd().resolve()
    virtual_root = start_dir  # initial virtual root is current working directory
    cwd = start_dir

    print("DeepSeek Agent REPL (PoC).")
    print(f"Working dir: {cwd}")
    print("Special commands: /i, /input, /exit, /save [FILENAME] [-f], /load FILENAME, /chroot [NEWROOT]")
    print("每次模型请求执行命令前，客户端会要求人工确认。仅用于测试。")
    print("-----\n")

    # messages with initial system prompt
    messages = [build_system_message(str(virtual_root))]

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
                print("退出，是否保存对话？ y/n", end=' ', flush=True)
                ans = input().strip().lower()
                if ans == "y":
                    save_path = input("保存到文件（回车为默认）: ").strip()
                    if not save_path:
                        save_path = "/sdcard/" + (datetime.now().strftime("%Y%m%dT%H%M%S")) + '.json'
                    with open(save_path, "w", encoding="utf-8") as f:
                        json.dump(messages, f, ensure_ascii=False, indent=2)
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
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(messages, f, ensure_ascii=False, indent=2)
                print(f"会话已保存到 {filename}")
                continue
            elif cmd == "/load":
                if not arg:
                    print("用法: /load FILENAME")
                    continue
                filename = arg.strip()
                if not os.path.exists(filename):
                    print(f"文件 {filename} 不存在。")
                    continue
                with open(filename, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                # basic sanity: loaded should be a list of messages
                if isinstance(loaded, list):
                    messages = loaded
                    # rebuild system prompt to reflect current virtual_root
                    messages.insert(0, build_system_message(str(virtual_root)))
                    clear_reasoning_content(messages)
                    print(f"已从 {filename} 加载会话（并清除 reasoning_content）")
                else:
                    print("文件格式无法识别（预期 JSON 数组）。")
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
                # ensure new root is inside initial start_dir? Here we allow any path under system, but you can restrict further.
                # For PoC we require newroot to be within start_dir to simulate virtual root without root privilege
                if not is_within_root(newroot_path, start_dir):
                    print("为了安全起见，PoC 要求新 root 必须在脚本启动目录之内。拒绝。")
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
            else:
                print("未知特殊命令。支持: /i, /input, /exit, /save, /load, /chroot")
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
                    render_stream_chunk(chunk)
        
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

            except Exception as e:
                print(f"\n[ERROR] 调用 DeepSeek 接口失败")
                import traceback
                traceback.print_exc()
                break
        
            print("\n-------------------------\n")
            
            tool_calls = list(tool_call_buffer.values()) or None
            
            # 如果有工具调用，并且 reasoning_content 为空但 content 不为空，把 content 当作 reasoning_content
            #if (tool_calls is not None) and (collected_message.get("reasoning_content") == "") and not (collected_message.get("content") == ""):
            #    collected_message["reasoning_content"], collected_message["content"] = collected_message["content"], ""

            # 追加 assistant 消息（让模型能在下一轮继续）
            messages.append({
                "role": "assistant",
                **({ "reasoning_content": collected_message["reasoning_content"] }
                   if collected_message["reasoning_content"] else {}),
                "content": collected_message["content"]
                   if collected_message["content"] else "",
                **({ "tool_calls": tool_calls }
                   if tool_calls else {}),
            })
        
            if not tool_calls:
                # 没有工具调用，说明是最终回答
                break
            
            # ---- process each tool call ----
            for tool in tool_calls:
                func_name = tool.get("function", {}).get("name")
                args_raw = tool.get("function", {}).get("arguments", "{}")
        
                try:
                    args = json.loads(args_raw)
                except Exception:
                    args = {"command": args_raw}
        
                command = args.get("command", "")
        
                print(f"{C.YELLOW}\n模型请求执行命令 (tool={func_name}):\n>>> {command}{C.RESET}\n")
                stripped = command.strip()
                if stripped.startswith("cd ") or stripped == "cd":
                    yn = 'y'
                    print("自动执行cd命令。")
                else:
                    yn = input("是否执行该命令？ (y:执行 / n:不执行 / s:跳过并返回空结果) ").strip()
                if yn.lower() not in ("y", "n", "s"):
                    print("将把自定义消息传递给模型。")
        
                if yn.lower() == "n":
                    result_str = "<user rejected execution>"
                    print("已拒绝执行。将返回拒绝结果给模型。")
        
                elif yn.lower() == "s":
                    result_str = "<skipped by user>"
                    print("已跳过（返回跳过标记）")
        
                elif yn.lower() == "y":
                    if stripped.startswith("cd ") or stripped == "cd":
                        cwd, result_str = handle_cd_command(command, cwd, virtual_root)
                        print(f"{C.DIM}{result_str}{C.RESET}")
                    else:
                        try:
                            result_str = execute_subprocess(command, cwd)
                        except Exception as e:
                            result_str = f"<exec failed: {e}>"
        
                        MAX_CHARS = 20000
                        if len(result_str) > MAX_CHARS:
                            result_str = result_str[:MAX_CHARS] + "\n...[truncated]"
        
                        print(f"{C.DIM}命令执行返回（前2000字符）:\n{result_str[:2000]}{C.RESET}\n")
                        
                else:
                    result_str = f"<user rejected execution and replied>\n{yn}"
        
                # 把工具执行结果回传给模型
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool.get("id"),
                    "content": result_str,
                })
        
            sub_turn += 1
        # 清理推理内容
        #for msg in messages:
        #    if msg.get("role") == "assistant" and "reasoning_content" in msg:
        #        msg["reasoning_content"] = None
        turn += 1
        # Loop back to read next user input

if __name__ == "__main__":
    enable_vt_mode()
    repl()
