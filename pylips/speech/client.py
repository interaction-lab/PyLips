from robot_face import RobotFace

if __name__ == '__main__':
    aimee = RobotFace(robot_name='aimee', tts_method='system', voice_id='com.apple.voice.premium.en-US.Zoe')
    aimee.tts.list_voices()

    nathan = RobotFace(robot_name='nathan', voice_id='Matthew')

    # send_message(request)
    while True:
        message = input("who will we make talk?: ")
        aimee.say(message)
            
        