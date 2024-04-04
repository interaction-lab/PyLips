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
    '''
    A text-to-speech backend that uses Amazon Polly.

    This class is used to generate audio files from text using Amazon Polly. It can also generate visemes
    that correspond to the audio files that it generates.

    args:
        None
    '''

    def __init__(self):
        self.tts = boto3.client('polly')

        # all current amazon polly voices
        self.voices = ['Zeina','Hala','Zayd','Lisa','Arlet','Hiujin','Zhiyu','Naja','Mads',
                       'Sofie','Laura','Lotte','Ruben','Nicole','Olivia','Russell','Amy','Emma',
                       'Brian','Arthur','Aditi','Raveena','Kajal','Niamh','Aria','Ayanda','Danielle',
                       'Gregory','Ivy','Joanna','Kendra','Kimberly','Salli','Joey','Justin','Kevin',
                       'Matthew','Ruth','Stephen','Geraint','Suvi','Celine','Léa','Mathieu','Rémi',
                       'Isabelle','Chantal','Gabrielle','Liam','Marlene','Vicki','Hans','Daniel',
                       'Hannah','Aditi','Kajal','Dora','Karl','Carla','Bianca','Giorgio','Adriano',
                       'Mizuki','Takumi','Kazuha','Tomoko','Seoyeon','Liv','Ida','Ewa','Maja','Jacek',
                       'Jan','Ola','Camila','Vitoria','Ricardo','Thiago','Ines','Cristiano','Carmen',
                       'Tatyana','Maxim','Conchita','Lucia','Enrique','Sergio','Mia','Andrés','Lupe',
                       'Penelope','Miguel','Pedro','Astrid','Elin','Filiz','Burcu','Gwyneth']

    def list_voices(self):
        '''
        Lists all the voices that are available in the Amazon Polly TTS backend.

        For a more in-depth look at the voices, see the `Amazon Polly documentation 
        <https://docs.aws.amazon.com/polly/latest/dg/voicelist.html>`_.

        args:
            None
        '''
        for i, voice in enumerate(self.voices):
            print(f'{i}: {voice}')

    def gen_audio_and_visemes(self, text, voice_id=None, fname=None):
        '''
        Generates an audio file and visemes from a string of text using Amazon Polly.

        args:
            text (str): the text that the robot should speak
            voice_id (str): the voice that the robot should speak in
            fname (str): the name of the file that the audio should be saved to

        returns:
            fname (str): the name of the file that the audio was saved to
            times (list[float]): a list of times that correspond to the initiation of the visemes
            visemes (list[str]): a list of visemes that correspond to the words in the audio
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
        Loads presaved audio and visemes from a file.

        args:
            fname (str): the name of the file that the audio and visemes were saved to
        
        returns:
            fname (str): the name of the file that the audio was saved to
            times (list[float]): a list of times that correspond to the initiation of the visemes
            visemes (list[str]): a list of visemes that correspond to the words in the audio
        
        raises:
            Exception: if the file does not exist
        '''
        #if it was already cached, return it, otherwise, raise an error
        fname = f"pylips_phrases/{fname}.mp3"

        if os.path.exists(fname):
            times, visemes = pickle.load(open(f'{fname[:-4]}.pkl', 'rb'))
            return fname, times, visemes
        else:
            raise Exception(f'phrase {fname} does not exist')