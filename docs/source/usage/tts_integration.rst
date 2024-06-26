Changing the TTS Backend
=====

The text-to-speech (TTS) backend is the software that actually converts text to speech. The default 
backend is your system's accessibility speech, which is simple, lightweight, and fast. However, 
it is not necessarily the most realistic or flexible TTS engine. There are several cloud services
that provide TTS, such as `Amazon Polly <https://aws.amazon.com/polly/>`_. PyLips currently
supports Amazon Polly, but we plan to add other services in the future.

Integrating with Amazon Polly
----------------

To use Amazon Polly, you will need to `set up the AWS CLI <https://docs.aws.amazon.com/polly/latest/dg/getting-started.html>`_ for your system. This `Medium article
<https://medium.com/@simonazhangzy/installing-and-configuring-the-aws-cli-7d33796e4a7c>`_ does a great job of explaining
the steps you will need to take. Be sure to allow Polly access; Polly has a free trial for one year
that allows you to perform TTS with up to 5 million characters per month for free.

Once you have set up the AWS CLI, you can use it by passing 'polly' to the ``RobotFace`` constructor:

.. code-block:: python

    from pylips import RobotFace

    face = RobotFace(tts_method='polly')

You can also pass different ``voice_ids`` as in the "changing the voice" example. A description
of the different voices for Polly are available `here <https://docs.aws.amazon.com/polly/latest/dg/voicelist.html>`_.

In addition, Amazon Polly has many options to customize the TTS output. Specifically, Polly uses
`SSML <https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html>`_ to customize the output.
SSML is a markup language that allows you to control the pitch, rate, volume, and other aspects of
the speech. You can directly pass SSML to the ``say`` method:

.. code-block:: python
    
    from pylips import RobotFace

    face = RobotFace(tts_method='polly')
    face.say('<prosody rate="slow">Hello, world!</prosody>')

