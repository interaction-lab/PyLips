from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import sys
import logging
import argparse

# host IP and port
parser = argparse.ArgumentParser()
parser.add_argument('--host', default='0.0.0.0', help='host IP address')
parser.add_argument('--port', default=8000, type=int, help='port over which serve')

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*") #allow communication on the same IP (main use case for this package)

app.static_folder = 'static' 

@app.route('/face')
@app.route('/face/<face_name>')
def index(face_name='default'):
    return render_template('index.html', face_name=face_name)

@app.route('/editor')
def editor():
    return render_template('editor.html')

@socketio.on('face_control')
def handle_message(message):
    print(f"received to {message['name']}: {message['action_type']}")
    emit('face_control', message, broadcast=True)

if __name__ == '__main__':
    args = parser.parse_args()
    socketio.run(app, host=args.host, port=args.port)
    
