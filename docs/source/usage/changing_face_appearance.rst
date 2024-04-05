Changing the Face Appearance
=====

Pylips allows you to change the appearance of the face!

In order to do this, all you have to do is use the ``.set_appearance()`` method. For
example, to change the color of the iris from purple to green, all you need to do is:

.. code-block:: python

    from pylips.speech import RobotFace

    face = RobotFace()
    face.set_appearance({'iris_color': '#00FF00'})

You can change almost every aspect about the face to achieve different designs. Here is a
complete list of the default parameters that can be changed:

.. code-block:: none

    'background_color': '#D7E4F5',
    'eyeball_color': '#ffffff',
    'iris_color': '#800080',
    'eye_size': 150,
    'eye_height': 80,
    'eye_separation': 400,
    'iris_size': 80,
    'pupil_scale': .7,
    'eye_shine': true,
    'eyelid_color': '#D7E4F5',
    'nose_color': '#ff99cc',
    'nose_vertical_position': 10,
    'nose_width': 0,
    'nose_height': 0,
    'mouth_color': '#2c241b',
    'mouth_width': 450,
    'mouth_height': 20,
    'mouth_thickness': 18,
    'brow_color': '#2c241b',
    'brow_width': 130,
    'brow_height': 120,
    'brow_thickness': 18

All hex values can optionally include an alpha value. For example, ``#FF0000`` is red, 
``#FF0000FF`` is red with full opacity, and ``#FF000000`` is red with no opacity 
(i.e., invisible). If you would like to remove a feature on the face, the easiest way
is to set the alpha value to ``00``.

We also provide a few presets for you to use, which are stored in the ``pylips.face`` module. 
You can import then like this:

.. code-block:: python

    from pylips.face import FacePresets

    face = RobotFace()
    face.set_appearance(FacePresets.gingerbreadman)


