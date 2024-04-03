import cv2
import mediapipe as mp
import sys
import numpy as np
from pylips.speech import RobotFace
import signal

X_SCALE = 720
Y_SCALE = 480
Z_SCALE = 100
SHOW_FACE = True

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

robot = RobotFace()

# For webcam input:
cap = cv2.VideoCapture(0)

def get_x_y_z(face):
  left_eye = mp_face_detection.get_key_point(face, mp_face_detection.FaceKeyPoint.LEFT_EYE)
  right_eye = mp_face_detection.get_key_point(face, mp_face_detection.FaceKeyPoint.RIGHT_EYE)
  eye_dist = np.sqrt((left_eye.x - right_eye.x)**2 + (left_eye.y - right_eye.y)**2)
  avg_x = (left_eye.x + right_eye.x) / 2
  avg_y = (left_eye.y + right_eye.y) / 2

  x = (avg_x -.5) * -X_SCALE
  y = (avg_y - .5) * -Y_SCALE
  z = Z_SCALE / (eye_dist)

  return x, y, z

def show_face(image, results):
    # Draw the face detection annotations on the image.
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    if results.detections:
      for detection in results.detections:
        mp_drawing.draw_detection(image, detection)

    # Flip the image horizontally for a selfie-view display.
    cv2.imshow('MediaPipe Face Detection', cv2.flip(image, 1))

    if cv2.waitKey(5) == ord('q'):
      exit(signal.SIGINT, None)

def exit(signum, frame):
    robot.release_gaze() 
    cap.release()
    sys.exit(0)

signal.signal(signal.SIGINT, exit)

with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
  while cap.isOpened():
    success, image = cap.read()
    if not success:
      sys.exit('ERROR: Unable to read from webcam. Please verify your webcam settings.')

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_detection.process(image)

    if results.detections is not None:    
        face = results.detections[0]
        x,y,z = get_x_y_z(face)
        robot.look(x,y,z, 150)

    if SHOW_FACE:
        show_face(image, results)


