import os
import requests
import json
import webbrowser
import subprocess
from urllib.parse import urlparse
from pathlib import Path
import re

def sanitize_filename(filename):
    # 定义非法字符的正则表达式（根据操作系统不同可能需要调整）
    # 这里适用于Windows/Linux/Android
    illegal_chars = r'[<>:"/\\|?*\x00-\x1F]'
    # 替换非法字符为下划线或移除
    sanitized = re.sub(illegal_chars, '_', filename)
    # 移除开头和结尾的空格和点（某些系统不允许）
    sanitized = sanitized.strip('. ')
    # 限制文件名长度（避免路径过长问题）
    return sanitized[:200]  # 限制最大长度

def process_user_input(user_input):
    # 处理用户输入
    if user_input.lower().startswith('av'):
        aid = user_input[2:]
    elif user_input.lower().startswith('bv'):
        bvid = user_input
    else:
        # 纯数字情况
        if user_input.isdigit():
            aid = user_input
        else:
            return None, None
    
    # 构建API URL
    if 'aid' in locals():
        return f"https://api.bilibili.com/x/web-interface/view?aid={aid}", 'aid'
    elif 'bvid' in locals():
        return f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}", 'bvid'
    else:
        return None, None

def download_image(url, save_path):
    # 创建目录如果不存在
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    # 下载图片
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        return True
    return False
    
def notify_media_scanner(save_path) -> str or None:
    """
    通知系统媒体扫描器扫描指定文件

    Args:
        save_path: 文件保存路径

    Returns:
        None: 扫描通知发送成功
        str: 失败描述信息
    """
    try:
        # 使用 Android 的 'am' 命令发送广播
        subprocess.run(
            ['am', 'broadcast',
             '-a', 'android.intent.action.MEDIA_SCANNER_SCAN_FILE',
             '-d', f'file://{save_path}'],
            check=True,
            capture_output=True,
            text=True
        )
        return None
    except subprocess.CalledProcessError as e:
        error_msg = f"发送广播失败: {e}"
        if e.stderr:
            error_msg += f", 错误输出: {e.stderr.strip()}"
        return error_msg
    except FileNotFoundError:
        error_msg = "'am' 命令未找到。可能不在Android环境或没有相关权限。"
        return error_msg
    except Exception as e:
        error_msg = f"未知错误: {e}"
        return error_msg

def main():
    user_input = input("请输入视频AV号或BV号: ").strip()
    
    api_url, id_type = process_user_input(user_input)
    if not api_url:
        print("错误: 输入格式不正确！请输入纯数字AV号或以BV开头的BV号。")
        return
    
    try:
        print("试图请求: " + api_url)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        # 修改后的请求代码
        response = requests.get(api_url, headers=headers)
        data = None
        
        try:
            # 尝试解析 JSON
            data = response.json()
        except json.JSONDecodeError:
            # 如果解析失败，显示原始内容
            print(f"解析失败！响应内容：{response.text}")
        
        if data['code'] != 0:
            print(f"请求被风控！code={data['code']}, message={data['message']}")
            choice = input("是否希望在浏览器中打开API链接? (y/N): ").strip().lower()
            if choice == 'y':
                webbrowser.open(api_url)
            return
        
        # 获取图片URL
        pic_url = data['data']['pic']
        parsed_url = urlparse(pic_url)
        path = parsed_url.path
        file_ext = Path(path).suffix
        
        # 构建保存路径
        if id_type == 'aid':
            filename = f"av{data['data']['aid']}"
        else:
            filename = f"{data['data']['bvid']}"
        filename = f"{sanitize_filename(data['data']['title'])} ({filename}){file_ext}"

        save_path = os.path.join("/storage/emulated/0/Pictures/BiliVideoCovers/", filename)
        
        # 下载图片
        if download_image(pic_url, save_path):
            print("视频封面下载完成！正在保存...", end="\r")
            save_r = notify_media_scanner(save_path)
            if save_r:
                print('保存失败!    ')
                print(save_r)
            else:
                print('已保存     ')
        else:
            print("封面下载失败！")
            
    except requests.exceptions.RequestException as e:
        print(f"网络请求出错: {e}")
    except KeyError as e:
        print(f"解析响应数据出错: {e}")
    except Exception as e:
        print(f"发生未知错误: {e}")

if __name__ == "__main__":
    main()
