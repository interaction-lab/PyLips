Changing the TTS Backend
=====

The text-to-speech (TTS) backend is the software that actually converts text to speech. The default 
backend is your system's accessibility speech, which is simple, lightweight, and fast. However, 
it is not necessarily the most realistic or flexible TTS engine. There are several cloud services
that provide TTS services, such as `Amazon Polly <https://aws.amazon.com/polly/>`_. PyLips currently
supports Amazon Polly, but we plan to add other services in the future.

Integrating with Amazon Polly
----------------

To use Amazon Polly, you will need to sset up the AWS CLI for your system. This `Medium article
<https://docs.aws.amazon.com/polly/latest/dg/getting-started.html>`_ does a great job of explaining
the steps you will need to take. Be sure to allow Polly access, Polly has a free trial for one year
that allows you to perform TTS with up to 5 million characters per month for free.

Once you have set up the AWS CLI, you can use it by passing 'polly' to the ``RobotFace`` constructor:

.. code-block:: python

    from pylips import RobotFace

    face = RobotFace(tts_method='polly')

You can also pass different ``voice_ids`` as in the :doc:`usage/changing_voice` example. A description
of the different voices available can be found `here <https://docs.aws.amazon.com/polly/latest/dg/voicelist.html>`_.

