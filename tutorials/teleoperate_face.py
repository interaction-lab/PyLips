import mediapipe as mp
from mediapipe import solutions
from mediapipe.framework.formats import landmark_pb2
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

from pylips.speech import RobotFace

import numpy as np
import cv2

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

def even_out_expression(expression, au, threshold):

    if abs(expression[f'AU{au}l'] - expression[f'AU{au}r']) < threshold:
            expression[f'AU{au}l'] = expression[f'AU{au}r']
    
    return expression


base_options = python.BaseOptions(model_asset_path='face_landmarker_v2_with_blendshapes.task')
options = vision.FaceLandmarkerOptions(base_options=base_options,
                                       output_face_blendshapes=True,
                                       output_facial_transformation_matrixes=True,
                                       num_faces=1)
detector = vision.FaceLandmarker.create_from_options(options)



face1 = RobotFace()

    
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