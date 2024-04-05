import sounddevice as sd
import soundfile as sf
import pickle 
import time
from pylips.speech import RobotFace
from pylips.speech.system_tts import IPA2VISEME

from allosaurus.app import read_recognizer


# SETUP 
duration = 3  # seconds
sd.default.samplerate = 44100
sd.default.channels = 1
device = 2

phoneme_model = read_recognizer()

robot = RobotFace()

time.sleep(2)
robot.express({'AU1l': 0.5, 'AU2l': 0.3, 'AU4r': 0.3}, 300)
#record
myrecording = sd.rec(int(duration * sd.default.samplerate), device=device)
print( "Recording Audio")
sd.wait()

robot.express({'AU1l': 0, 'AU2': 0, "AU4": 0}, 300)

sf.write('pylips_phrases/parroted.wav', myrecording, sd.default.samplerate)

# save to file
out = phoneme_model.recognize('pylips_phrases/parroted.wav', timestamp=True, lang_id='eng')

times = [i.split(' ')[0] for i in out.split('\n')]
visemes = [IPA2VISEME[i.split(' ')[-1]] for i in out.split('\n')]

times.append(len(myrecording)/sd.default.samplerate + 0.2)
visemes.append('IDLE')

pickle.dump((times, visemes), open(f'pylips_phrases/parroted.pkl', 'wb'))


#say file
robot.say_file('parroted')
robot.wait()