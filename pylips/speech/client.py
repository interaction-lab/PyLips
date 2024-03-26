from .robot_face import RobotFace

if __name__ == '__main__':
    aimee = RobotFace(robot_name='aimee', tts_method='system', voice_id='com.apple.voice.premium.en-US.Zoe')
    aimee.tts.list_voices()

    nathan = RobotFace(robot_name='nathan', voice_id='Matthew')

    # send_message(request)
    while True:
        message = input("who will we make talk?: ")

        aimee.update_face({
            'background_color': '#ddc1e3',
            'eyeball_color': '#ffffff',
            'iris_color': '#5a8594',
            'eye_size': 150,
            'eye_height': 30,
            'eye_separation': 400,
            'iris_size': 90,
            'pupil_scale': 0.8,
            'eye_shine': True,
            'eyelid_color': '#ddc1e3',
            'nose_color': '#9bbce0',
            'nose_vertical_position': 0,
            'nose_width': 20,
            'nose_height': 70,
            'mouth_color': '#9bbce0',
            'mouth_width': 380,
            'mouth_height': 20,
            'mouth_thickness': 18,
            'brow_color': '#9bbce0',
            'brow_width': 140,
            'brow_height': 120,
            'brow_thickness': 20
        })
            
        