Teleoperate the Face
===================================

This tutorial will walk you through mimicking your facial expressions on the PyLips face.

It might be unintuitive to programmatically author facial expressions. Luckily, people make
facial expressions ALL the time, so we can leverage people's natural expressions to make
PyLips expressions. We used the package MediaPipe to track people's facial expressions.
Then, we can replay this expression on the PyLips face. This makes it easier to generate
unique expressions. 

In this tutorial, we will be using the ``MediaPipe`` library to track a person's face and
render their expression in real time.

Prior to beginning this tutorial, ensure that you have run ``python3 -m pylips.face.start`` to 
start the robot face. You may also need to install the ``MediaPipe`` library using
``python3 -m pip install MediaPipe``.

The model for face detection needs to be downloaded to be used. 
We provide the version we use in this tutorial at `this link <https://github.com/interaction-lab/PyLips/raw/main/tutorials/models/face_landmarker_v2_with_blendshapes.task>`_.
Alternatively, you can download it with this command:

.. code-block:: bash

    # For users with wget (Linux)
    wget https://github.com/interaction-lab/PyLips/raw/main/tutorials/models/face_landmarker_v2_with_blendshapes.task -O face_landmarker_v2_with_blendshapes.task
    # For users with curl (Windows/Mac)
    curl https://github.com/interaction-lab/PyLips/raw/main/tutorials/models/face_landmarker_v2_with_blendshapes.task -o face_landmarker_v2_with_blendshapes.task


First, we will import all the necessary libraries for this tutorial.

.. code-block:: python

    import mediapipe as mp
    from mediapipe import solutions
    from mediapipe.framework.formats import landmark_pb2
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision

    from pylips.speech import RobotFace

    import numpy as np
    import cv2


These are some utility functions provided by MediaPipe to draw the face detection on the video feed.

.. code-block:: python

    def cv2_imshow(image):
        cv2.imshow("picture",image)
        cv2.waitKey(0)

    def draw_landmarks_on_image(rgb_image, detection_result):
    face_landmarks_list = detection_result.face_landmarks
    annotated_image = np.copy(rgb_image)

    # Loop through the detected faces to visualize.
    for idx in range(len(face_landmarks_list)):
        face_landmarks = face_landmarks_list[idx]

        # Draw the face landmarks.
        face_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
        face_landmarks_proto.landmark.extend([
        landmark_pb2.NormalizedLandmark(x=landmark.x, y=landmark.y, z=landmark.z) for landmark in face_landmarks
        ])

        solutions.drawing_utils.draw_landmarks(
            image=annotated_image,
            landmark_list=face_landmarks_proto,
            connections=mp.solutions.face_mesh.FACEMESH_TESSELATION,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp.solutions.drawing_styles
            .get_default_face_mesh_tesselation_style())
        solutions.drawing_utils.draw_landmarks(
            image=annotated_image,
            landmark_list=face_landmarks_proto,
            connections=mp.solutions.face_mesh.FACEMESH_CONTOURS,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp.solutions.drawing_styles
            .get_default_face_mesh_contours_style())
        solutions.drawing_utils.draw_landmarks(
            image=annotated_image,
            landmark_list=face_landmarks_proto,
            connections=mp.solutions.face_mesh.FACEMESH_IRISES,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp.solutions.drawing_styles
            .get_default_face_mesh_iris_connections_style())

    return annotated_image


MediaPipe has some small errors in the values it returns  between the right and left side, but 
people usually use symmetric expressions. If the left and right side expressions slightly 
differ, we will even them out to appear more realistic.

.. code-block:: python

    def even_out_expression(expression, au, threshold):
        if abs(expression[f'AU{au}l'] - expression[f'AU{au}r']) < threshold:
                expression[f'AU{au}l'] = expression[f'AU{au}r']
        
        return expression


Initialize the PyLips face and the MediaPipe face landmarker model.

.. code-block:: python    
    
    base_options = python.BaseOptions(model_asset_path='face_landmarker_v2_with_blendshapes.task')
    options = vision.FaceLandmarkerOptions(base_options=base_options,
                                        output_face_blendshapes=True,
                                        output_facial_transformation_matrixes=True,
                                        num_faces=1)
    detector = vision.FaceLandmarker.create_from_options(options)

    face1 = RobotFace()


Next, we create a mapping between the blendshapes provided by MediaPipe and facial action units.
We define a weight for each blendshape to better mirror facial expressions.

.. code-block:: python
        
    NAME2AUWEIGHT = {
        #brows
        'browInnerUp' : ['AU1', 3],
        'browDownLeft' : ['AU4l', 5],
        'browDownRight' : ['AU4r', 5],
        'browOuterUpLeft' : ['AU2l', 3],
        'browOuterUpRight' : ['AU2r', 3],
        # eyes
        'eyeBlinkLeft' : ['AU43l', 2],
        'eyeBlinkRight' : ['AU43r', 2],
        # mouth
        'jawOpen' : ['AU26', 5],
        'mouthStretchLeft' : ['AU27l', 5],
        'mouthStretchRight' : ['AU27r', 5],
        'mouthDimpleLeft' : ['AU14l', 1],
        'mouthDimpleRight' : ['AU14r', 1],
        'mouthPucker' : ['AU18', 1.75],
        'mouthPressLeft' : ['AU24l', 1],
        'mouthPressRight' : ['AU24r', 1],
        'mouthFrownLeft' : ['AU15l', 4],
        'mouthFrownRight' : ['AU15r', 4],
    }


Lastly, we combine all these functions together to allow the camera to capture and track faces in real time.
Every time we receive an image from a webcam, we follow these steps:


1. Process image with MediaPipe
2. Draw results for user
3. Map from blendshapes to action units
4. Make action units more symmetric
5. Pass detected action units through a smoothing filter to reduce jittering


When you finish, select the camera window and press the q key to end the process.

.. code-block:: python

    cap = cv2.VideoCapture(0)

    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()

        frame = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame)
        detection_result = detector.detect(frame)
        annotated_image = draw_landmarks_on_image(frame.numpy_view(), detection_result)

        
        try:
            expression = {}
            for face_blendshape in detection_result.face_blendshapes[0]:
                if face_blendshape.category_name in NAME2AUWEIGHT:
                    au, weight = NAME2AUWEIGHT[face_blendshape.category_name]
                    expression[au] = face_blendshape.score * weight

            expression = even_out_expression(expression, 43, .2)
            expression = even_out_expression(expression, 14, .2)
            expression = even_out_expression(expression, 24, .2)
            expression = even_out_expression(expression, 27, .2)
            expression = even_out_expression(expression, 4, .2)
            expression = even_out_expression(expression, 15, .2)
            
            # blend in the current reading with the previous facial expression
            try:
                for key in expression:
                    true_expression[key] = .5 * true_expression[key] + .5 * expression[key]
            except Exception as e:
                print(e)
                true_expression = expression

            face1.express(true_expression, 25)

        except Exception as e:
            print(e)


        # Display the resulting frame
        cv2.imshow('frame', annotated_image)
        if cv2.waitKey(5) == ord('q'):
            break

        
    cap.release()
    cv2.destroyAllWindows()