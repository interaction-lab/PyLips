"""``speech`` contains the Python functions for interacting with the PyLips face.

The RobotFace class is the main class that is used to interact with the robot's face. 
It contains methods for speaking text, saving speech to a file, and stopping speech.

The PollyTTS and SystemTTS classes are used to generate speech audio files from text. 
The RobotFace class uses these classes to generate speech audio files and visemes. As
future systems are developed, additional TTS classes can be added to this module.

.. autosummary::
    :toctree:

    pylips.speech.RobotFace
    pylips.speech.PollyTTS
    pylips.speech.SystemTTS

"""

from pylips.speech.polly_tts import PollyTTS
from pylips.speech.system_tts import SystemTTS
from pylips.speech.robot_face import RobotFace

__all__ = [
    "RobotFace",
    "PollyTTS",
    "SystemTTS",
]