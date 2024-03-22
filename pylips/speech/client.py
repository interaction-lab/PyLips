from robot_face import RobotFace
import time

if __name__ == '__main__':
    aimee = RobotFace(robot_name='aimee', voice_id='Justin')
    nathan = RobotFace(robot_name='nathan', voice_id='Matthew')

    # send_message(request)
    while True:
        message = input("who will we make talk?: ")
        if message == 'nathan':
            nathan.update_face({'pupil_scale': .4})
            nathan.express({'AU1':.5, 'AU4l': 0.5}, 1000)
            nathan.say('It is nice to meet you, I am a robot face')
            
        if message == 'aimee':
            nathan.release_gaze()
            aimee.say('It is nice to meet you, I am a robot face')
            nathan.stop_speech()
        