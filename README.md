# PyLips

[![Downloads](https://static.pepy.tech/badge/pylips)](https://pepy.tech/project/pylips)

![The PyLips Logo](docs/source/_static/imgs/pylips_text.png)

**PyLips** is a Python-based interface for developing screen-based conversational agents.
It is designed to make developing socially assistive robotics easier by providing a
simple, expressive, and customizable framework for developing conversational agents.


PyLips is easy to install, simple to use, and open-source.
It comes ready to use with your system's speech synthesis tools, and
uses other free and open-source software for turning these sounds into facial expressions.

![The PyLips Faces](docs/source/_static/imgs/many_faces.png)

## To Install from PyPI

You can install PyLips using pip. To install PyLips, run this command in your terminal:

```
python3 -m pip install pylips
```

If you are running PyLips on a Linux Distribution, you may need to also install the following packages:

```
sudo apt update && sudo apt install espeak-ng ffmpeg libespeak1
```

## PyLips Quickstart

Here is a quick example to test your installation. This code will make your computer face say 
"Hello, welcome to pylips!". The voice will be the default system voice, but this is something
we can change later.

First, we will have to start the PyLips server. This is a simple flask sever that can serve several
faces at the same time. To start the server, run the following command:

```
python3 -m pylips.face.start
```

This will start the server on port 8000. Do not worry about the warning message, the package will 
still work. You can connect any web browser to the urls printed, even across computers on the local network.
For now, just open a browser and go to `http://localhost:8000/face` to see the face.

Now open a new terminal tab and run the following code:

```
from pylips.speech import RobotFace

face = RobotFace()
# you may need to wait here for a minute or two to let allosaurus download on the first run

face.say("Hello, welcome to pylips!")
```

If all goes well, the face should have said the message!


