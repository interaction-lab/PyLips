import boto3
import json
import os
from contextlib import closing
import pickle

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


class PollyTTS:

    def __init__(self):
        self.tts = boto3.client('polly')

    def gen_audio_and_visemes(self, text, voice_id=None, fname=None):
        '''
        generates an audio file that says the text of _text_ in the voice of _voice_id_

        :param: text - the text that the robot should speak
        :param: voice_id - the voice that the robot should speak in
        :param: fname - the name of the file that the audio should be saved to
        '''
        if voice_id is None:
            voice_id = 'Justin'
            
        if fname is None:   
            fname = f"pylips_phrases/{voice_id}_output.mp3"
        else:
            #if it was already cached, return it, otherwise, generate it and return it
            fname = f"pylips_phrases/{fname}.mp3"
            if os.path.exists(fname):
                times, visemes = pickle.load(open(f'{fname[:-4]}.pkl', 'rb'))
                return fname, times, visemes

        # Synthesize speech
        response = self.tts.synthesize_speech(
            TextType='ssml',
            Text=f"<speak>{text}</speak>",
            OutputFormat='mp3',
            VoiceId=voice_id
        )

        audio_stream = response["AudioStream"]

        if not os.path.isdir('pylips_phrases'):
            os.mkdir('pylips_phrases')
             
        with open(fname, "wb") as file:
            file.write(audio_stream.read())

        # Synthesize visemes
        # Synthesize speech with viseme output
        response = self.tts.synthesize_speech(
            TextType='ssml',
            Text=f"<speak>{text}</speak>",
            OutputFormat='json',
            SpeechMarkTypes=['viseme'],
            VoiceId=voice_id
        )
        
         # Process the response
        if 'AudioStream' in response:
            # Do something with the audio stream if needed
            with closing(response["AudioStream"]) as stream:
                        data = stream.read().decode('utf-8')
                        xSheet = data.split('\n')
                        xSheet = [json.loads(line) for line in xSheet if line != '']

        times = [x['time'] / 1000. for x in xSheet]
        visemes = [VIS2IPA[x['value']] for x in xSheet]

        pickle.dump((times, visemes), open(f'{fname[:-4]}.pkl', 'wb'))

        return fname, times, visemes
    
    def get_audio_and_visemes(self, fname):
        '''
        
        '''
        #if it was already cached, return it, otherwise, raise an error
        fname = f"pylips_phrases/{fname}.mp3"

        if os.path.exists(fname):
            times, visemes = pickle.load(open(f'{fname[:-4]}.pkl', 'rb'))
            return fname, times, visemes
        else:
            raise Exception(f'phrase {fname} does not exist')