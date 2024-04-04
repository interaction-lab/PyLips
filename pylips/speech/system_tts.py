import pyttsx3
from allosaurus.app import read_recognizer
import soundfile as sf
import pickle
import os

from sys import platform

IPA2VISEME = {
    'sil': 'IDLE',
    '': 'IDLE',
    
    'k͡p̚': 'BILABIAL', 
    'm': 'BILABIAL',
    'b': 'BILABIAL',
    'p': 'BILABIAL',

    'v': 'LABIODENTAL',
    'f': 'LABIODENTAL',

    'θ': 'INTERDENTAL',
    'ð': 'INTERDENTAL',

    'l': 'DENTAL_ALVEOLAR',
    'd': 'DENTAL_ALVEOLAR',
    't': 'DENTAL_ALVEOLAR',
    'tʰ': 'DENTAL_ALVEOLAR',
    'n': 'DENTAL_ALVEOLAR',
    'ɳ': 'DENTAL_ALVEOLAR',
    's': 'DENTAL_ALVEOLAR',
    'z': 'DENTAL_ALVEOLAR',
    
    'ʃ': 'POSTALVEOLAR',
    'ʒ': 'POSTALVEOLAR',
    'ɹ̩': 'POSTALVEOLAR',
    'ɹ': 'POSTALVEOLAR',
    'r': 'POSTALVEOLAR',
    'ɻ': 'POSTALVEOLAR',
    'ɾ': 'POSTALVEOLAR',
    'dʒ': 'POSTALVEOLAR',
    'tʃ': 'POSTALVEOLAR',
    't͡ʃʲ': 'POSTALVEOLAR',
    'ij': 'POSTALVEOLAR',
    'tɕʰ': 'POSTALVEOLAR',
    'x': 'POSTALVEOLAR',

    'h': 'VELAR_GLOTTAL',
    'k': 'VELAR_GLOTTAL',
    'g': 'VELAR_GLOTTAL',
    'ɡ': 'VELAR_GLOTTAL',
    'ŋ': 'VELAR_GLOTTAL',
    'h': 'VELAR_GLOTTAL',
    'ʔ': 'VELAR_GLOTTAL',
    

    'ɪ': 'CLOSE_FRONT_VOWEL',
    'iː': 'CLOSE_FRONT_VOWEL',
    'j': 'CLOSE_FRONT_VOWEL',
    'e': 'CLOSE_FRONT_VOWEL',
    'i': 'CLOSE_FRONT_VOWEL',

    'ɛ': 'OPEN_FRONT_VOWEL',
    'a': 'OPEN_FRONT_VOWEL',
    'æ': 'OPEN_FRONT_VOWEL',

    'ə': 'MID_CENTRAL_VOWEL',
    'ɚ': 'MID_CENTRAL_VOWEL',
    
    'w': "CLOSE_BACK_VOWEL",
    'ʊ': 'CLOSE_BACK_VOWEL',
    'u': 'CLOSE_BACK_VOWEL',
    'uː': 'CLOSE_BACK_VOWEL',
    'ɯ': 'CLOSE_BACK_VOWEL',

    'o': 'OPEN_BACK_VOWEL',
    'ɔ': 'OPEN_BACK_VOWEL',
    'ɑ': 'OPEN_BACK_VOWEL',
    'ɒ': 'OPEN_BACK_VOWEL',
    'ʌ': 'OPEN_BACK_VOWEL',   
}

class SystemTTS:
    '''
    A text-to-speech backend that uses the system's default TTS engine.

    args:
        None
    '''
    def __init__(self):
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 120)
        self.model = read_recognizer()
        self.voices = [voice.id for voice in self.engine.getProperty('voices')]

    def list_voices(self):
        '''
        Lists all the voices that are available in the system's default TTS backend.
        
        args:
            None
        '''
        for i, voice in enumerate(self.voices):
            print(f'{i}: {voice}')

    def gen_audio_and_visemes(self, text, voice_id=None, fname=None):
        '''
        Generates audio and visemes from a string of text using the system's default TTS engine.

        args:
            text (str): the text that the robot should speak
            voice_id (str): the voice that the robot should speak in
            fname (str): the name of the file that the audio should be saved to
        
        returns:
            fname (str): the name of the file that the audio was saved to
            times (list[float]): a list of times that correspond to the initiation of the visemes
            visemes (list[str]): a list of visemes that correspond to the words in the audio

        raises:
            Exception: if the voice_id is not in the list of available voices
        '''
        if voice_id is None:
            voice_id = 'en' if platform == "linux" or platform == "linux2" else 'default'
        
        elif type(voice_id) == int and voice_id < len(self.voices):
            voice_id = self.voices[voice_id]

        elif voice_id not in self.voices:
            raise Exception(f'voice "{voice_id}" does not exist')
        else:
            self.engine.setProperty('voice', voice_id)

        if fname is None:   
            fname = f"pylips_phrases/{voice_id}_output.wav"
        else:
            #if it was already cached, return it, otherwise, generate it and return it
            fname = f"pylips_phrases/{fname}.wav"
            if os.path.exists(fname):
                times, visemes = pickle.load(open(f'{fname[:-4]}.pkl', 'rb'))
                return fname, times, visemes

        # Synthesize speech
        if platform == "linux" or platform == "linux2":
            # linux has issues with saving multiple files...
            os.system(f"espeak-ng -v {voice_id} -s 100 '{text}' -w {fname}")
        else:
            self.engine.save_to_file(text, fname)
            self.engine.runAndWait()

        data, samplerate = sf.read(fname)
        sf.write(fname, data, samplerate)

        #synthesize visemes
        out = self.model.recognize(fname, timestamp=True, lang_id='eng')

        times = [i.split(' ')[0] for i in out.split('\n')]
        visemes = [IPA2VISEME[i.split(' ')[-1]] for i in out.split('\n')]


        times.append(len(data)/samplerate + 0.2)
        visemes.append('IDLE')

        pickle.dump((times, visemes), open(f'{fname[:-4]}.pkl', 'wb'))

        return fname, times, visemes
    
    def get_audio_and_visemes(self, fname):
        '''
        Gets the audio and visemes from a file that was previously generated.

        args:
            fname (str): the name of the file that the audio and visemes were saved to. It is not
                         necessary to include the file extension.
        
        returns:
            fname (str): the name of the file that the audio was saved to
            times (list[float]): a list of times that correspond to the initiation of the visemes
            visemes (list[str]): a list of visemes that correspond to the words in the audio
        '''
        #if it was already cached, return it, otherwise, raise an error
        fname = f"pylips_phrases/{fname}.wav"

        if os.path.exists(fname):
            times, visemes = pickle.load(open(f'{fname[:-4]}.pkl', 'rb'))
            return fname, times, visemes
        else:
            raise Exception(f'phrase {fname} does not exist')