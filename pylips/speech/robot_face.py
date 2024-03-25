import socketio
import boto3
from contextlib import closing
import json
import pickle
import pygame
import time
import os

from .polly_tts import PollyTTS
from .system_tts import SystemTTS

class RobotFace:
    def __init__(self,
                 robot_name: str = 'default',
                 server_ip: str = 'http://localhost:8000',
                 tts_method: str = 'system',
                 voice_id: str = None):
        '''
            The main class for the PyLips project.
            :param: robot_name - the identity of the robot that should be speaking
            :param: server_ip - the location of the server running the flask application.
        '''

        if os.path.exists('pylips_phrases') == False:
            os.mkdir('pylips_phrases')

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
        if tts_method == 'system':
            self.tts = SystemTTS()
        if tts_method == 'polly':
            self.tts = PollyTTS()

    def say(self, content):
        '''
            The main method for the RobotFace class. This method will take in a string of text and
            convert it to speech using the AWS Polly service.
            :param: content - the text that the robot should speak
        '''

        fname, times, visemes = self.tts.gen_audio_and_visemes(content, self.voice_id)

        request = { 
                'name': self.name,
                'action_type': 'say',
                'visemes': visemes,
                'times': times,
             }
        

        #load sound
        while pygame.mixer.Channel(self.channel).get_busy():
            self.channel += 1
             
        sound = pygame.mixer.Sound(fname)

        #play sound and face
        self.io.emit('face_control', request)
        pygame.mixer.Channel(self.channel).play(sound)

    def save_file(self, content, filename):
        '''
            The main method for the RobotFace class. This method will take in a string of text and
            convert it to speech.
            :param: content - the text that the robot should speak
        '''
        self.tts.gen_audio_and_visemes(content, self.voice_id, filename)
         

    def say_file(self, filename):

        fname, times, visemes = self.tts.get_audio_and_visemes(filename)

        request = { 
                'name': self.name,
                'action_type': 'say',
                'visemes': visemes,
                'times': times,
             }
        
        #load sound
        while pygame.mixer.Channel(self.channel).get_busy():
            self.channel += 1
             
        sound = pygame.mixer.Sound(fname)

        #play sound and face
        self.io.emit('face_control', request)
        pygame.mixer.Channel(self.channel).play(sound)


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


         
