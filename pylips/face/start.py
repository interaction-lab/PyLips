from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import argparse

# host IP and port
parser = argparse.ArgumentParser()
parser.add_argument('--host', default='0.0.0.0', help='host IP address')
parser.add_argument('--port', default=8000, type=int, help='port over which serve')
parser.add_argument('--skip-audio-unlock', action='store_true',
                    help='Disable the audio unlock overlay (auto-unlock audio).')

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*") #allow communication on the same IP (main use case for this package)

app.static_folder = 'static' 

@app.route('/face')
@app.route('/face/<face_name>')
def index(face_name='default'):
    # Pass a flag to template to control overlay rendering
    disable_overlay = getattr(app, 'disable_audio_overlay', False)
    return render_template('index.html', face_name=face_name, disable_audio_overlay=disable_overlay)

@app.route('/editor')
def editor():
    return render_template('editor.html')

@socketio.on('face_control')
def handle_message(message):
    print(f"received to {message['name']}: {message['action_type']}")
    emit('face_control', message, broadcast=True)

@socketio.on('play_audio_file')
def handle_play_audio(data):
    """Send audio file data to browser for playback"""
    filename = data.get('filename')
    target_name = data.get('name', 'default')  # Which face should play the audio
    audio_base64 = data.get('audio_data')
        
        # Send audio data to the specific client or broadcast to all
    emit('play_audio', {
        'name': target_name,
        'filename': filename,
        'audio_data': audio_base64,
        'mime_type': 'audio/wav'
    }, broadcast=True)
    

if __name__ == '__main__':
    args = parser.parse_args()
    # Store chosen overlay behavior on app config
    app.disable_audio_overlay = args.skip_audio_unlock
    socketio.run(app, host=args.host, port=args.port)
    
