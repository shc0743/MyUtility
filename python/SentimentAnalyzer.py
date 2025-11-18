import requests
import json

class SentimentAnalyzer:
    def __init__(self, api_key):
        self.api_key = api_key
        self.api_url = "https://api.deepseek.com/chat/completions"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    def analyze_sentiment(self, text):
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "You're a backend application programming interface. The system is asking the user whether he(she) wants to perform an operation. The user will provide a text containing positive or negative answer. What you should only reply with is 'true' referring to positive meanings, 'false' to negative meanings, or 'null' if you couldn't judge it. Do not reply with any extra words."},
                {"role": "user", "content": text}
            ],
            "stream": False
        }

        try:
            response = requests.post(self.api_url, headers=self.headers, data=json.dumps(payload))
            response.raise_for_status()
            result = response.json()
            # Assuming the API returns the sentiment in the 'choices' field
            sentiment = result.get('choices', [{}])[0].get('message', {}).get('content', 'null').strip().lower()
            if sentiment in ['true', 'false', 'null']:
                return sentiment
            else:
                return 'null'
        except requests.exceptions.RequestException as e:
            print(f"Error making API request: {e}")
            return 'null'

# Example usage:
# analyzer = SentimentAnalyzer(api_key="your_deepseek_api_key_here")
# result = analyzer.analyze_sentiment("I love this product!")
# print(result)  # Output: true
