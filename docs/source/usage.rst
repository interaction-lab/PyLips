Usage
=====

.. _install:

Installing PyLips
------------

You can install PyLips using pip. To install PyLips, run this command in your terminal:

.. code-block:: console

   $ python3 -m pip install pylips

If you are running PyLips on a Linux Distribution, you may need to also install the following packages:

.. code-block:: console

   $ sudo apt update && sudo apt install espeak ffmpeg libespeak1


PyLips Quickstart
----------------

Here is a quick example to test your installation. This code will make your computer face say 
"Hello, welcome to pylips!". The voice will be the default system voice, but this is something
we can change later.

First, we will have to start the PyLips server. This is a simple flask sever that can serve several
faces at the same time. To start the server, run the following command:

.. code-block:: console

   $ python3 -m pylips.face.start

This will start the server on port 8000. Do not worry about the warning message, the package will 
still work. You can connect any web browser to the urls printed, even across computers on the local network.
For now, just open a browser and go to `http://localhost:8000/face` to see the face.

Now open a new terminal tab and run the following code:

.. code-block:: python

   from pylips.speech import RobotFace

   face = RobotFace()
   face.say("Hello, welcome to pylips!")

If all goes well, the face should have said the message!



