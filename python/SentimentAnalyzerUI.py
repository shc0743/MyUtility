from SentimentAnalyzer import SentimentAnalyzer

def main():
    # 替换为你的 DeepSeek API 密钥
    api_key = "sk-"
    analyzer = SentimentAnalyzer(api_key)

    print("情感分析测试程序")
    print("输入文本以分析情感（输入 /exit 退出）：")

    while True:
        user_input = input("请输入文本: ").strip()

        # 检查是否退出
        if user_input.lower() == "/exit":
            print("退出程序。")
            break

        # 调用情感分析接口
        result = analyzer.analyze_sentiment(user_input)
        print(f"分析结果: {result}")

if __name__ == "__main__":
    main()
