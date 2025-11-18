import webbrowser
from SentimentAnalyzer import SentimentAnalyzer  # 导入 SentimentAnalyzer 模块

# 全局变量：云原神网页 URL
CLOUD_GENSHIN_URL = "https://ys.mihoyo.com/cloud/"  # 替换为实际的云原神网页链接

def open_webpage(url):
    """
    打开指定网页
    """
    try:
        print(f"正在打开网页：{url}...")
        webbrowser.open(url)
        print("网页已成功打开！")
    except Exception as e:
        print(f"打开网页失败：{e}")

def ask_for_confirmation(analyzer):
    """
    询问用户是否同意打开“云原神”网页，并分析用户的回答
    如果无法判断用户输入，提示用户重新输入
    """
    while True:
        user_input = input("你是否同意打开“云原神”？请输入你的回答（例如：'是的，我同意' 或 '不，我不同意'）：")
        
        # 使用 SentimentAnalyzer 分析用户输入的情绪
        sentiment = analyzer.analyze_sentiment(user_input)
        
        if sentiment == "true":
            print("正在打开...")
            return True
        elif sentiment == "false":
            print("取消打开网页。")
            return False
        else:
            print("无法判断，请重新输入你的回答。")

def main():
    # 初始化 SentimentAnalyzer
    api_key = "sk-"  # 替换为你的 API Key
    analyzer = SentimentAnalyzer(api_key)

    # 询问用户是否同意打开网页
    if ask_for_confirmation(analyzer):
        open_webpage(CLOUD_GENSHIN_URL)  # 调用打开网页函数
    else:
        print("操作已取消。")

if __name__ == "__main__":
    main()
