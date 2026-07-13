#!/usr/bin/env python3
from flask import Flask, request
import sqlite3
from datetime import datetime

app = Flask(__name__)
DB = "./data.db"

sqlite3.connect(DB).execute("CREATE TABLE IF NOT EXISTS requests(id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, timestamp TEXT, value TEXT)").connection.close()

@app.route('/a/f/t/f', methods=['POST'])
def handle():
    value = request.get_data(as_text=True)
    if len(value) > 5000:
        return "Value too long, maximum 5000 characters\n", 400, {'Content-Type': 'text/plain'}
    ip = request.remote_addr
    ts = datetime.utcnow().isoformat()
    conn = sqlite3.connect(DB)
    conn.execute("INSERT INTO requests (ip, timestamp, value) VALUES (?, ?, ?)", (ip, ts, value))
    conn.commit(); conn.close()
    return "OK\n", 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    app.run(host='::', port=31885, ssl_context=('./cert.cer', './cert.key'), threaded=True)
