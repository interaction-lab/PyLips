from robot_face import RobotFace
import time

if __name__ == '__main__':
    aimee = RobotFace(robot_name='aimee', voice_id='Justin')
    nathan = RobotFace(robot_name='nathan', voice_id='Matthew')

    # send_message(request)
    while True:
        message = input("who will we make talk?: ")
        if message == 'nathan':
            nathan.save_file('Hello, my name is Nathan', 'greeting')

            
        if message == 'aimee':
            nathan.update_face({'eyelid_color': '#D7E4F500'})
            
            nathan.say_file('greeting')
            aimee.say("Hello, my name is Aimee")
            
        