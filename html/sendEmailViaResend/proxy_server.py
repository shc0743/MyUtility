from flask import Flask, request, Response
import requests

app = Flask(__name__)

@app.route('/request', methods=['OPTIONS', 'POST'])
def proxy_request():
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = Response(status=200)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Method'
        return response

    # Parse query string for target URL
    target_url = request.args.get('url')
    if not target_url:
        return Response("Missing 'url' query parameter", status=400)

    # Parse X-Method header for HTTP method
    method = request.headers.get('X-Method', 'GET').upper()
    if method not in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']:
        return Response("Invalid HTTP method in 'X-Method' header", status=400)

    # Forward the request to the target URL
    try:
        response = requests.request(
            method=method,
            url=target_url,
            headers={key: value for key, value in request.headers if key != 'Host'},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False
        )
    except requests.RequestException as e:
        return Response(f"Error forwarding request: {str(e)}", status=500)

    # Create a response with the same content and status code
    proxy_response = Response(
        response.content,
        status=response.status_code,
        headers=dict(response.headers)
    )

    # Allow CORS
    proxy_response.headers['Access-Control-Allow-Origin'] = '*'
    proxy_response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    proxy_response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Method'

    return proxy_response

if __name__ == '__main__':
    print('Server will run on port 8993')   
    app.run(host='127.0.0.1', port=8993)