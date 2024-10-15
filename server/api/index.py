from flask import Flask, request
from flask_cors import CORS
from app import app as flask_app

app = Flask(__name__)
CORS(app)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return flask_app(request.environ, lambda x, y: None)

# Vercel 서버리스 함수 핸들러
def handler(request):
    return app(request)