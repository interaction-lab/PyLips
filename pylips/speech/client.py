from pylips.speech import RobotFace

if __name__ == '__main__':
    aimee = RobotFace(robot_name='aimee', tts_method='system', voice_id='com.apple.voice.premium.en-US.Zoe')
    aimee.tts.list_voices()

    nathan = RobotFace(robot_name='nathan', voice_id='Matthew')

    # send_message(request)
    while True:
        message = input("who will we make talk?: ")

        aimee.set_appearance({
            'background_color': '#cccccc',
            'eyeball_color': '#ffffff',
            'iris_color': '#43d932',
            'eye_size': 150,
            'eye_height': 80,
            'eye_separation': 400,
            'iris_size': 90,
            'pupil_scale': 0.8,
            'eye_shine': True,
            'eyelid_color': '#cccccc',
            'nose_color': '#9bbce0',
            'nose_vertical_position': 0,
            'nose_width': 0,
            'nose_height': 0,
            'mouth_color': '#222222',
            'mouth_width': 320,
            'mouth_height': 30,
            'mouth_thickness': 18,
            'brow_color': '#222222',
            'brow_width': 110,
            'brow_height': 120,
            'brow_thickness': 20
        })

        aimee.say('hey diva, did you remember to SLAY Today?')
            
        