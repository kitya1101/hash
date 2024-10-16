from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Flask!"})

# Vercel serverless function handler
def handler(event, context):
    return app(event['body'], event['headers'])