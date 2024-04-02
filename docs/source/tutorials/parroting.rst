Repeat After Me
===================================

This tutorial will walk you through manually generating visemes by recording an
audio file and then playing it back using the robot face.

One critique of text-to-speech systems is that they can sound robotic. One way to
improve the naturalness of the speech is to use actual human speech. Human speech can
reflect a wide variety of emotions and intentions that are difficult to capture in plain 
text. If you are using PyLips for an interaction with mostly pre-recorded speech, you can
record your own voice (or hire a voice actor) to record the phrases you need in your 
interaction.

In this tutorial, we will be using the `sounddevice` and `soundfile` libraries to record a 3 second
audio clip. We will then use the `allosaurus` library to recognize the phonemes in the audio file.
Finally, we will use the `RobotFace` class to play back the audio file and display the visemes on the robot face.

Prior to beginning this tutorial, ensure that you have run `python3 -m pylips.face.start` to 
start the robot face. You may also need to install the `sounddevice` and `soundfile` libraries using
`python3 -m pip install sounddevice soundfile`.  `allosaurus` is included in the PyLips requirements, 
so you should not need to install it separately.

First, we will import all the necessary libraries for this tutorial.

.. code-block:: python
    import sounddevice as sd
    import soundfile as sf
    import pickle 

    from pylips.speech import RobotFace
    from pylips.speech.system_tts import IPA2VISEME

    from allosaurus.app import read_recognizer


Next, we will set up some parameters we will use later. To change the
behavior of this script, you can experiment with different values for
``duration`` to change the length of the recorded audio. You may also 
need to modify the ``sd.default.samplerate`` and ``sd.default.channels``
variables to match the audio input of your microphone.

.. code-block:: python
    # sound recording parameters
    duration = 3  # seconds
    sd.default.samplerate = 44100
    sd.default.channels = 1

    # load allosaurus for phoneme recognition
    phoneme_model = read_recognizer()

    # create robot face object for speaking
    robot = RobotFace()


Next, we use the `sounddevice` library to record an audio clip and save 
the audio clip to a file in the `pylips_phrases` directory, which is automatically
created when the pylips face is instantiated.

.. code-block:: python
    #record
    myrecording = sd.rec(int(duration * sd.default.samplerate))
    print( "Recording Audio")
    sd.wait()

    sf.write('pylips_phrases/parroted.wav', myrecording, sd.default.samplerate)


Next, we use the `allosaurus` library to recognize the phonemes in the audio file.
We then convert the phonemes to visemes using the `IPA2VISEME` dictionary, and save
the result in the expected format for PyLips.

.. code-block:: python
    out = phoneme_model.recognize('pylips_phrases/parroted.wav', timestamp=True, lang_id='eng')

    times = [i.split(' ')[0] for i in out.split('\n')]
    visemes = [IPA2VISEME[i.split(' ')[-1]] for i in out.split('\n')]

    times.append(len(myrecording)/sd.default.samplerate + 0.2)
    visemes.append('IDLE')

    pickle.dump((times, visemes), open(f'pylips_phrases/parroted.pkl', 'wb'))


Finally, we use the `RobotFace` class to play back the audio file and display 
the visemes on the robot face. We use the existing `say_file` method to play the files
we created in the previous step.

.. code-block:: python
    robot.say_file('parroted')
    robot.wait()

You are done! You can now run the script and record your own voice to play back on the robot face.