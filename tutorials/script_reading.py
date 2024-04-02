from pylips.speech import RobotFace
from pylips.face import face_presets
script = '''
FARQUAAD: I've tried to be fair to you. Now my patience has reached its end. Tell me or I'll...
GINGERBREAD MAN: No, no, not the buttons. Not my gumdrop buttons.
FARQUAAD: All right then. Who's hiding them?
GINGERBREAD MAN: Okay, I'll tell you. Do you know the muffin man?
FARQUAAD: The muffin man?
GINGERBREAD MAN: The muffin man.
FARQUAAD: Yes, I know the muffin man, who lives on Drury Lane?
GINGERBREAD MAN: Well, she's married to the muffin man.
FARQUAAD: The muffin man?
GINGERBREAD MAN: The muffin man!
FARQUAAD: She's married to the muffin man.
'''

actors = {
        'FARQUAAD': RobotFace(robot_name='FARQUAAD', voice_id=RobotFace().tts.voices[14]),
        'GINGERBREAD MAN': RobotFace(robot_name='GINGERBREAD MAN', voice_id=RobotFace().tts.voices[142])
    }

actors['FARQUAAD'].set_appearance(face_presets.chili)
actors['GINGERBREAD MAN'].set_appearance(face_presets.gingerbreadman)

for line in script.split('\n'):
    if ':' not in line:
        continue

    actor, content = line.split(':')
    face = actors[actor]
    face.say(content)
    face.wait()