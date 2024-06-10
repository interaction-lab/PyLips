Usage
=====

.. _install:

Installing PyLips
------------
.. note::

   We have identified an error installing PyLips on python 3.12 on Mac OS. The current workaround
   is to downgrade to python 3.11. We are working on a fix for this issue.

You can install PyLips using pip. To install PyLips, run this command in your terminal:

.. code-block:: console

   $ python3 -m pip install pylips

If you are running PyLips on a Linux Distribution, you may need to also install the following packages:

.. code-block:: console

   $ sudo apt update && sudo apt install espeak-ng ffmpeg libespeak1


PyLips Quickstart
----------------

Here is a quick example to test your installation. This code will make your computer face say 
"Hello, welcome to pylips". The voice will be the default system voice, but this is something
we can change later.

First, we will have to start the PyLips server. This is a simple flask server that can serve several
faces at the same time. To start the server, run the following command:

.. code-block:: console

   $ python3 -m pylips.face.start

This will start the server on port 8000. Do not worry about the warning message, the package will 
still work. You can connect any web browser to the urls printed, even across computers on the local network.
For now, just open a browser and go to ``http://localhost:8000/face`` to see the face.

Now open a new terminal tab and run the following code:

.. code-block:: python

   from pylips.speech import RobotFace

   face = RobotFace()
   # you may need to wait here for a minute or two to let allosaurus download on the first run

   face.say("Hello, welcome to pylips!")

If all goes well, the face should have said the message!

.. note::

   PyLips generates a folder in the directory you run it called ``pylips_phrases``. This folder is used to 
   store the generated sound files. You may delete this folder at any time, but it will be re-created when needed.

Tell us how this process went by filling out `this survey <https://forms.gle/h9PtDMpZnvXqR9bf6>`_! We are looking to improve the installation process for PyLips!


More Features of PyLips
----------------
Follow these other guides to learn more about PyLips:

.. toctree::
   :maxdepth: 2
   :titlesonly:

   usage/changing_voice
   usage/changing_face_appearance
   usage/tts_integration
   usage/making_expressions
   usage/multiple_faces
