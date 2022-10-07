'''
Stock Helper Python Script
Version     1.1
'''

import sys
import ctypes
import requests
import bs4
import json


html_default_parser = 'html5lib'
http_default_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'


def myreq_get(f, c):
    return requests.request('get', f(c), headers= { "User-Agent": http_default_user_agent })

def get_10jqka_url_baseinfo(code):
    return 'http://stockpage.10jqka.com.cn/' + (code) + '/'
def get_10jqka_url_head2info(code):
    return 'http://stockpage.10jqka.com.cn/realHead_v2.html#hs_' + (code)
def get_10jqka_url_realhead(code):
    return 'https://d.10jqka.com.cn/v2/realhead/hs_' + (code) + '/last.js'



def my_app_1(code):
    info_base = myreq_get(get_10jqka_url_baseinfo, code)
    if info_base.status_code != 200:
        print("[!] [1] HTTP 错误:", info_base.status_code)
        return False
    # info_base_b = bs4.BeautifulSoup(info_base.text, html_default_parser)
    print("[基本信息]")
    print("URL:", info_base.url)

def my_app_2(code):
    '''
    # These are trashed because get it directly can't get real data

    info = myreq_get(get_10jqka_url_head2info, code)
    if info.status_code != 200:
        print("[!] [2] HTTP 错误:", info.status_code)
        return False
    # print(info)
    bs = bs4.BeautifulSoup(info.text, html_default_parser)
    print("[个股行情]")

    fvp = bs.select_one('#fvaluep')
    print("市盈率(动):", fvp.text)
    '''
    print("[个股行情]")

    myreq_get(get_10jqka_url_head2info, code)
    requests.get('https://s.thsi.cn/cb?/css/stockpage/s2015/;home.css;personkzd.css;nav_v2.css;append.css&20150620', headers={"User-Agent":http_default_user_agent})

    info = requests.get(get_10jqka_url_realhead(code), headers={ "User-Agent": http_default_user_agent, "sec-fetch-dest": "script"})
    print("URL:", info.url)
    if info.status_code != 200:
        print("[!] [2] HTTP 错误:", info.status_code)
        return False
    try:
        print(json.loads(info.text))
        pass
    except json.decoder.JSONDecodeError:
        print('ERROR')
        pass
    pass



def my_main():
    try:
        code = (input('输入股票代码: '))
        int(code)
    except:
        ctypes.WinDLL('user32.dll').MessageBoxW(ctypes.WinDLL('kernel32.dll').GetConsoleWindow(), '股票代码无效!', 0, 0x10)
        return
    
    print('====================', end= '\n')

    my_app_1(code)
    print('', end='\n')
    my_app_2(code)



    pass

def main():
    try:
        val = my_main()
    except Exception as exc:
        print("[ERROR]", exc)

    input("\n按 Enter 继续 ...")
    return val





if __name__=='__main__':
    main()

