import socketio
import boto3
from contextlib import closing
import json
import pickle
import pygame
import time
import os

class RobotFace:
    def __init__(self,
                 robot_name: str = 'default',
                 server_ip: str = 'http://localhost:8000',
                 tts_method: str = 'polly',
                 voice_id: str = 'Justin'):
        '''
            The main class for the Web-Enabled Facial Text-to-Speech (WEFacTTS) project.
            :param: robot_name - the identity of the robot that should be speaking
            :param: server_ip - the location of the server running the flask application.
        '''
        self.name = robot_name
        self.voice_id = voice_id

        self.io = socketio.Client()
        self.io.connect(server_ip)

        pygame.mixer.init()
        self.channel = 0

        tts_methods = ['polly']
        if tts_method not in tts_method:
            raise Exception(f'parameter tts_method must be one of {tts_methods}')
        
        # TODO: implement other TTS things, but for now we will use polly
        if tts_method == 'polly':
            self.tts = boto3.client('polly')

    def say(self, content):
        '''
            The main method for the RobotFace class. This method will take in a string of text and
            convert it to speech using the AWS Polly service.
            :param: content - the text that the robot should speak
        '''

        response = self.tts.synthesize_speech(
            TextType='ssml',
            Text=f"<speak>{content}</speak>",
            OutputFormat='mp3',
            VoiceId=self.voice_id
        )

        # Get the audio stream
        audio_stream = response["AudioStream"]

        # Play the audio stream
        with open(f"{self.name}_output.mp3", "wb") as file:
            file.write(audio_stream.read())
        
        
        
        # Synthesize speech with viseme output
        response = self.tts.synthesize_speech(
            TextType='ssml',
            Text=f"<speak>{content}</speak>",
            OutputFormat='json',
            SpeechMarkTypes=['viseme'],
            VoiceId=self.voice_id
        )

        # Process the response
        if 'AudioStream' in response:
            # Do something with the audio stream if needed
            with closing(response["AudioStream"]) as stream:
                        data = stream.read().decode('utf-8')
                        xSheet = data.split('\n')
                        xSheet = [json.loads(line) for line in xSheet if line != '']
        
        VIS2IPA = {"p": "BILABIAL",
                "f": "LABIODENTAL",
                "T": "INTERDENTAL",
                "s": "DENTAL_ALVEOLAR",
                "t": "DENTAL_ALVEOLAR",
                "S": "POSTALVEOLAR",
                "r": "POSTALVEOLAR",
                "k": "VELAR_GLOTTAL",
                "i": "CLOSE_FRONT_VOWEL",
                "u": "CLOSE_BACK_VOWEL",
                "@": "MID_CENTRAL_VOWEL",
                "a": "OPEN_FRONT_VOWEL",
                "e": "OPEN_FRONT_VOWEL",
                "E": "OPEN_FRONT_VOWEL",
                "o": "OPEN_BACK_VOWEL",
                "O": "OPEN_BACK_VOWEL",
                "sil": "IDLE"}

        times = [x['time'] / 1000. for x in xSheet]
        visemes = [VIS2IPA[x['value']] for x in xSheet]

        request = { 
                'name': self.name,
                'action_type': 'say',
                'visemes': visemes,
                'times': times,
             }
        

        #load sound
        while pygame.mixer.Channel(self.channel).get_busy():
            self.channel += 1
             
        sound = pygame.mixer.Sound(f"{self.name}_output.mp3")
        # pygame.mixer.Channel(self.channel).music.load(f"{self.name}_output.mp3")

        
        #play sound and face
        self.io.emit('face_control', request)
        pygame.mixer.Channel(self.channel).play(sound)


    def say_file(self, filename):
        if not os.path.exists(filename):
             raise Exception(f'phrase {filename} does not exist')
        times, visemes = pickle.load(open(filename, 'rb'))

        request = { 
                'name': self.name,
                'action_type': 'say',
                'visemes': visemes,
                'times': times,
             }

    def stop_speech(self):
        request = { 
                'name': self.name,
                'action_type': 'stop_speech',
             }
        
        self.io.emit('face_control', request)
        pygame.mixer.Channel(self.channel).stop()
         
        
    def look(self, x, y, z, time):
        '''
        Looks to a location in the face's reference frame.
        x,y,z in mm
        time in ms
        '''
        request = {
                'name': self.name,
                'action_type': 'look',
                'location': [x,y,z],
                'time': time
            }
        self.io.emit('face_control', request)

    def release_gaze(self):
        '''
        allows robot to move eyes idly
        '''
        request = {
            'name': self.name,
            'action_type': 'release_gaze',
        }
        self.io.emit('face_control', request)

    def express(self, aus, time):
        request = {
            'name': self.name,
            'action_type': 'express',
            'aus': aus,
            'time': time
        }
        self.io.emit('face_control', request)

    def update_face(self, config):
        request = {
            'name': self.name,
            'action_type': 'update_face',
            'configuration': config
        }
        self.io.emit('face_control', request)
        time.sleep(.3)


         
