Creating Multiple Faces
=====

What's better than one PyLips face? Two PyLips faces!

PyLips was designed to control multiple faces as once. This works by assigning
a unique name to each face, and then using that name to control the face. This
is done by passing the name to the ``RobotFace`` constructor.

.. code-block:: python

    from pylips.speech import RobotFace

    face1 = RobotFace(robot_name='face1')
    face2 = RobotFace(robot_name='face2')

This will create two faces, one named ``face1`` and the other named ``face2``.
To access these faces, you will navigate to ``localhost:8000/face/face1`` and
``localhost:8000/face/face2``. You can then send different commands to each of
the faces.

.. code-block:: python

    face1.say('Hello, world!')
    face1.wait()

    face2.say('Hello, world!')
    face2.wait()

If you do not use the ``.wait()`` function, both faces will speak at the same
time. This is because the ``.say()`` function is non-blocking, and will return
immediately.