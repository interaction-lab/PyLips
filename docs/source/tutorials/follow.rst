Follow with MediaPipe
===================================

This tutorial walks you through integrating ``RobotFace`` with `MediaPipe's face detector
<https://developers.google.com/mediapipe/solutions/vision/face_detector>`_.

While PyLips does not provide any perceptual capabilities, it works well with other
Python packages that do. We can use the data we collect from these packages to change
the face's behavior. In this tutorial we will update the robot's gaze to follow the user's eyes.

You will need a webcam for this tutorial. Prior to beginning this tutorial, ensure that you 
have run ``python3 -m pylips.face.start`` to  start the robot face. You may also need to install 
the ``mediapipe`` and ``cv2`` libraries using ``python3 -m pip install mediapipe opencv-python``.  
``numpy`` is included in the PyLips requirements, so you should not need to install it separately, 
and the other imports are standard Python libraries.

First, we will import the necessary libraries and set up the robot face. We will also define some
constants to scale the mediapipe coordinates to real world coordinates. You may change these values
to better suit your specific setup.

.. code-block:: python
    
    import cv2
    import mediapipe as mp
    import sys
    import numpy as np
    from pylips.speech import RobotFace
    import signal

    X_SCALE = 720
    Y_SCALE = 480
    Z_SCALE = 100

Now we will set up the components to detect the person's face. This involves creating the mediapipe
object to do face detection and the webcam object to capture the video feed. We will also set up the
robot face object.

.. code-block:: python

    mp_face_detection = mp.solutions.face_detection
    mp_drawing = mp.solutions.drawing_utils

    robot = RobotFace()
    last_look = time.time()

    # For webcam input:
    cap = cv2.VideoCapture(0)

From here, we will need to develop three functions for the core of our program: (1) getting the x,y,z location
of the person's head in the real world, (2) drawing the detection boxes from mediapipe, and (3) what to do when we
exit the program.


Face Detection to X,Y,Z Coordinates
------------

We will define a function that takes in `a face detection object from mediapipe 
<https://developers.google.com/mediapipe/solutions/vision/face_detector/python>`_ and returns the x,y,z location of 
the person's head in the real world.

.. code-block:: python

    def get_x_y_z(face):
        # Get the left and right eye key points, the average of these will be our x,y location
        left_eye = mp_face_detection.get_key_point(face, mp_face_detection.FaceKeyPoint.LEFT_EYE)
        right_eye = mp_face_detection.get_key_point(face, mp_face_detection.FaceKeyPoint.RIGHT_EYE)
        avg_x = (left_eye.x + right_eye.x) / 2
        avg_y = (left_eye.y + right_eye.y) / 2

        # We will calculate the distance between the eyes to determine the z value
        eye_dist = np.sqrt((left_eye.x - right_eye.x)**2 + (left_eye.y - right_eye.y)**2)
        
        # Scale the x,y,z values to the real world
        # the output of media pipe is a value between 0 and 1, so we will subtract .5, so
        # the 0 value represents the center of the screen. Then we scale to convert to mm.
        x = (avg_x -.5) * -X_SCALE
        y = (avg_y - .5) * -Y_SCALE
        z = Z_SCALE / (eye_dist)

        return x, y, z


Exit Strategy
------------

Since we will be using the webcam, we have to run our program in a loop. In order to leave all devices
how we found them, we will need to release the gaze and the webcam when we exit the program. This function
takes two arguments, the signal number and the frame. These arguments are provided by the ``signal`` library
when the program catches a control+c keystroke. 

.. code-block:: python

    def exit(signum, frame):
        robot.release_gaze() 
        cap.release()
        sys.exit(0)
    
    # When the user presses control+c, call the exit function
    signal.signal(signal.SIGINT, exit)


Drawing a Detection Box
------------

Finally, to visualize the results of the mediapipe detection for debugging purposes, we will create
a function to draw the detection boxes on the screen. This allows you to make sure you are in frame,
and better understand why the gaze of the robot is behaving the way it is. ``image`` is the image
captured from the webcam, and ``results`` is the face detection results from mediapipe.

.. code-block:: python

    def show_face(image, results):
        # Allow the image to be written to
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Draw the detection boxes using the mediapipe drawing utilities
        if results.detections:
            for detection in results.detections:
                mp_drawing.draw_detection(image, detection)

        # Flip the image and display for a selfie-view display.
        cv2.imshow('MediaPipe Face Detection', cv2.flip(image, 1))

        # If the user presses 'q', exit the program
        if cv2.waitKey(5) == ord('q'):
            exit(signal.SIGINT, None)


Putting It All Together
------------

Now that we have all the components, we can put them together in a loop. We will repeatedly read from
the webcam, then we will process the image with mediapipe. If a face is detected, we will get the x,y,z
location in the real world and update the robot's gaze. If the user has set the ``SHOW_FACE`` variable to
``True``, we will show the face detection boxes on the screen. The program can be exited by pressing 'q'.
on the image window or by pressing control+c in the terminal.

.. code-block:: python

    # Create the face_detection model
    with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
        # Loop forever to get the webcam feed
        while cap.isOpened():
            success, image = cap.read()
            if not success:
            sys.exit('ERROR: Unable to read from webcam. Please verify your webcam settings.')

            # Convert the image and run face detection
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_detection.process(image)

            # If there is a face in the image, get the x,y,z location
            if results.detections is not None:    
                face = results.detections[0]
                x,y,z = get_x_y_z(face)
                robot.look(x,y,z, 150)

            # If we set SHOW_FACE to True in the beginning, we will show the face detection boxes
            if SHOW_FACE:
                show_face(image, results)