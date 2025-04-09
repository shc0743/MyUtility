#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import readline  # 提供更好的输入体验
from encryption import encrypt_data, decrypt_data
from getpass import getpass

def get_multiline_input(prompt):
    """获取多行输入，直到用户输入Ctrl-D"""
    print(prompt)
    print("输入多行内容，按Ctrl-D(Unix)或Ctrl-Z(Windows)结束输入:")
    lines = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        pass
    return '\n'.join(lines)

def main():
    print("=== 安全加密解密工具 ===")
    print("1. 加密文本")
    print("2. 解密文本")
    print("3. 退出")
    
    while True:
        try:
            choice = input("\n请选择操作 (1/2/3): ").strip()
            
            if choice == '1':
                # 加密操作
                print("\n[加密模式]")
                plaintext = get_multiline_input("请输入要加密的文本:")
                
                key = getpass("请输入加密密钥: ")
                while not key:
                    print("密钥不能为空!")
                    key = input("请输入加密密钥: ").strip()
                
                custom_phrase = input("可选: 输入自定义短语(留空使用随机): ").strip()
                custom_n = input("可选: 输入Scrypt的N参数(留空使用默认262144): ").strip()
                
                try:
                    n = int(custom_n) if custom_n else None
                    encrypted = encrypt_data(
                        plaintext, 
                        key, 
                        phrase=custom_phrase if custom_phrase else None,
                        N=n
                    )
                    print("\n加密成功! 结果如下:\n")
                    print(encrypted)
                    print("\n请妥善保存整个输出，解密时需要它。")
                except Exception as e:
                    print(f"加密失败: {str(e)}")
                
            elif choice == '2':
                # 解密操作
                print("\n[解密模式]")
                encrypted_data = input("请输入要解密的JSON数据:")
                key = getpass("请输入解密密钥: ")
                while not key:
                    print("密钥不能为空!")
                    key = input("请输入解密密钥: ").strip()
                
                try:
                    decrypted = decrypt_data(encrypted_data, key)
                    print("\n解密成功! 结果如下:\n")
                    print(decrypted)
                except Exception as e:
                    print(f"解密失败: {str(e)}")
                
            elif choice == '3':
                print("再见!")
                sys.exit(0)
                
            else:
                print("无效选择，请输入1、2或3")
                
        except KeyboardInterrupt:
            print("\n操作已取消")
        except Exception as e:
            print(f"发生错误: {str(e)}")

if __name__ == "__main__":
    main()