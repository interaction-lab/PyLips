Two Robots Talking
===================================

This tutorial walks you through using the ``RobotFace`` class to simulate two robots talking to each other.

One strength of PyLips is its ability to simulate multiple robots talking to each other. 
This is useful for developing multi-robot systems, as well as for creating more complex 
and interesting interactions between conversational agents. We will perform a simple pre-defined
script from `a famous movie scene from Shrek (2001) <https://www.youtube.com/watch?v=mFl8nzZuExE&ab_channel=Movieclips>`_
where two characters: Lord Farquaad and the Gingerbread Man, speak to each other while 
referencing a children's fairy tale.

This tutorial uses the base functionality of PyLips, so no additional libraries are required.

First, we import the necessary classes and functions from PyLips, and write out the script:

.. code-block:: python

    from pylips.speech import RobotFace
    from pylips.face import FacePresets
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


Next, we define the actors in the scene and set their appearances and voices. This can be extended
to different numbers of characters, and different appearances and voices can be set for each character.
You may change the voices based on the available voices on your system.

.. code-block:: python

    VOICE1 = RobotFace().tts.voices[0]
    VOICE2 = RobotFace().tts.voices[1]

    actors = {
            'FARQUAAD': RobotFace(robot_name='FARQUAAD', voice_id=VOICE1),
            'GINGERBREAD MAN': RobotFace(robot_name='GINGERBREAD MAN', voice_id=VOICE2)
        }

    actors['FARQUAAD'].set_appearance(FacePresets.chili)
    actors['GINGERBREAD MAN'].set_appearance(FacePresets.gingerbreadman)


Once we have defined these characters, they will be available at the urls ``localhost:8000/face/FARQUAAD`` 
and ``localhost:8000/face/GINGERBREAD MAN``. Be sure to run ``python3 -m pylips.face.start`` to 
connect to these faces.

Finally, we iterate over the lines in the script. For each line, we split the line on the ':' character
to obtain the actor that will speak the line, and the content of the line. We then use the ``say`` method
of the actor to speak the content, and the ``wait`` method to wait for the speech to finish before moving on.

.. code-block:: python

    for line in script.split('\n'):
        if ':' not in line:
            continue

        actor, content = line.split(':')
        face = actors[actor]
        face.say(content)
        face.wait()
