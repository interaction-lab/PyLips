import base64
import socketio
from contextlib import closing
import pygame
import time
import os

from .polly_tts import PollyTTS
from .system_tts import SystemTTS

class RobotFace:
    '''
    The controllable interface for speech, gaze, and expressions. 
    
    Args:
        robot_name (str): the identity of the robot that should be speaking
        server_ip (str): the location of the server running the flask application.
        tts_method (str): the method that the robot should use to generate speech.
        voice_id (str): the voice that the robot should use to generate speech.
    '''
    def __init__(self,
                 robot_name: str = 'default',
                 server_ip: str = 'http://localhost:8000',
                 tts_method: str = 'system',
                 voice_id: str = None):

        if os.path.exists('pylips_phrases') == False:
            os.mkdir('pylips_phrases')

        self.name = robot_name
        self.voice_id = voice_id

        try:
            self.io = socketio.Client()
            self.io.connect(server_ip)
        except socketio.exceptions.ConnectionError as e:
            print(f'Error connecting to server at {server_ip}. Try running:\npython3 -m pylips.face.start')

        pygame.mixer.init()
        self.channel = 0

        tts_methods = ['polly', 'system']
        if tts_method not in tts_methods:
            raise Exception(f'parameter tts_method must be one of {tts_methods}')
        
        # TODO: implement other TTS things, but for now we will use polly
        if tts_method == 'system':
            self.tts = SystemTTS()
        if tts_method == 'polly':
            self.tts = PollyTTS()

    def say(self, content, wait=False):
        '''
            Issues a speech command to the face.

            This method will take in a string of text and convert it to speech. This method
            may also shift ``self.channel`` to avoid competing with other connected faces.

            Args:
                content (str): the text that the robot should speak
                wait (bool): whether or not the function should wait for the speech to finish
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

        while wait and pygame.mixer.Channel(self.channel).get_busy():
            pygame.time.wait(100)

    def save_file(self, content, tag):
        '''
            Saves a speech file to the disk.

            This method will take in a string of text and create the pkl and sound
            files necessary to call ``say_file`` later. 

            Args:
                content (str): the text that the robot should speak
                tag (str): the tag to refer to the file. This should be a string with
                    no extensions or folder paths -- e.g., 'statement1' or 'question2'
        '''
        self.tts.gen_audio_and_visemes(content, self.voice_id, tag)
         

    def say_file(self, tag):
        '''
            Plays a speech file that was saved to the disk.

            Args:
                tag (str): the tag that was used to save the file. This should be a string with
                    no extensions or folder paths -- e.g., 'statement1' or 'question2'
        '''

        fname, times, visemes = self.tts.get_audio_and_visemes(tag)

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


    def stream_file_to_browser(self, tag):
        '''
            Streams an audio file directly to the browser for playback.
            
            This method sends the audio file data to the browser via WebSocket,
            where it will be played automatically without going through pygame.
            
            Args:
                filename (str): the name of the audio file to stream (should be in pylips_phrases directory)
        '''
        fname, times, visemes = self.tts.get_audio_and_visemes(tag)
        print(f"Streaming {fname} to browser")

        # open the file and encode it as base64 to send to the browser
        try:
            with open(fname, 'rb') as audio_file:
                audio_data = audio_file.read()
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        except Exception as e:
            print(f"Error reading audio file: {str(e)}. Are you sure you generated it?")
            return
        
        self.io.emit('play_audio_file', {
            'filename': fname,
            'name': self.name,
            'audio_data': audio_base64,
            'mime_type': 'audio/wav'
        })

        self.io.emit('face_control', {
            'name': self.name,
            'action_type': 'say',
            'visemes': visemes,
            'times': times,
        })

    def stop_speech(self):
        '''
        Cancels the current speech command.

        If the robot is speaking, the robot will stop speaking and the visemes will stop playing.
        If the robot is not speaking, this method will have no effect.

        Args:
            None
        '''
        request = { 
                'name': self.name,
                'action_type': 'stop_speech',
             }
        
        self.io.emit('face_control', request)
        pygame.mixer.Channel(self.channel).stop()
         
        
    def look(self, x, y, z, time):
        '''
        Looks to a location in the face's reference frame.

        The robots references frame has its origin at the center of the eyes, with the positive 
        x-axis pointing to the right, the positive y-axis pointing up, and the positive z-axis 
        pointing out of the face.

        TODO: add a check to make sure the location is within the robot's range of motion

        Args:
            x (float): the x-coordinate in millimeters
            y (float): the y-coordinate in millimeters
            z (float): the z-coordinate in millimeters
            time (int): the time in milliseconds that the robot should take to look to the location
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
        Cancels the current gaze command.

        If the robot is looking at a location, the robot will stop looking at that location and
        return to its default gaze behaviors, looking idly in different directions. If the robot
        is not looking at a location, this method will have no effect.

        Args:
            None
        '''
        request = {
            'name': self.name,
            'action_type': 'release_gaze',
        }
        self.io.emit('face_control', request)

    def express(self, aus, time):
        '''
        Activates a set of Action Units (AUs) on the face.

        The robot's face is controlled by a set of Action Units (AUs) that can be activated to
        create different facial expressions. This method will take in a dictionary of AUs that
        maps the AU number to the intensity that the AU should be activated at. The method will
        also take in a time in milliseconds to reach the requested AU state.

        Action units can also be unilateral, meaning that they can be activated on one side of the
        face. For example, AU1 is the inner brow raiser, and activating it on one side of the face
        can be done by specifying 'AU01l' or 'AU01r' in the dictionary.

        Args:
            aus (dict): a dictionary of AUs that maps the AU number to the intensity that the AU should 
                be activated at -- e.g., {'AU1': 1.0, 'AU2': 0.5, 'AU3': 0.0}
            time (int): the time in milliseconds that the robot should take to reach the requested AU state
        '''
        request = {
            'name': self.name,
            'action_type': 'express',
            'aus': aus,
            'time': time
        }

        self.io.emit('face_control', request)

    def set_appearance(self, config):
        '''
        Changes the design of the face.

        Different parameters can be passed to the face to change its appearance. This method will
        take in a dictionary of configuration parameters that will be used to change the face's
        appearance, and update the face to reflect the new configuration.

        Args:
            config (dict): a dictionary of configuration parameters that will be used to change the face's
                appearance -- e.g., {'iris_color': '#00FF00', 'eye_size': 200, 'eye_height': 60}
        '''
        request = {
            'name': self.name,
            'action_type': 'update_face',
            'configuration': config
        }
        self.io.emit('face_control', request)
        time.sleep(.3)

    def wait(self):
        '''
        Waits for the current speech command to finish.

        This method will wait for the current speech command to finish before returning. If the robot
        is not speaking, this method will return immediately.

        Args:
            None
        '''
        while pygame.mixer.Channel(self.channel).get_busy():
            pygame.time.wait(100)


         
