from pylips.speech import RobotFace
from pylips.speech.system_tts import IPA2VISEME

import time

if __name__ == '__main__':
    # phones = ['I', 'a', 'aː', 'ã', 'ă', 'b', 'bʲ', 'bʲj', 'bʷ', 'bʼ', 'bː', 'b̞', 'b̤', 'b̥', 'c', 'd', 'dʒ', 'dʲ', 'dː', 'd̚', 'd̥', 'd̪', 'd̯', 'd͡z', 'd͡ʑ', 'd͡ʒ', 'd͡ʒː', 'd͡ʒ̤', 'e', 'eː', 'e̞', 'f', 'fʲ', 'fʷ', 'fː', 'g', 'gʲ', 'gʲj', 'gʷ', 'gː', 'h', 'hʷ', 'i', 'ij', 'iː', 'i̞', 'i̥', 'i̯', 'j', 'k', 'kx', 'kʰ', 'kʲ', 'kʲj', 'kʷ', 'kʷʼ', 'kʼ', 'kː', 'k̟ʲ', 'k̟̚', 'k͡p̚', 'l', 'lʲ', 'lː', 'l̪', 'm', 'mʲ', 'mʲj', 'mʷ', 'mː', 'n', 'nj', 'nʲ', 'nː', 'n̪', 'n̺', 'o', 'oː', 'o̞', 'o̥', 'p', 'pf', 'pʰ', 'pʲ', 'pʲj', 'pʷ', 'pʷʼ', 'pʼ', 'pː', 'p̚', 'q', 'r', 'rː', 's', 'sʲ', 'sʼ', 'sː', 's̪', 't', 'ts', 'tsʰ', 'tɕ', 'tɕʰ', 'tʂ', 'tʂʰ', 'tʃ', 'tʰ', 'tʲ', 'tʷʼ', 'tʼ', 'tː', 't̚', 't̪', 't̪ʰ', 't̪̚', 't͡s', 't͡sʼ', 't͡ɕ', 't͡ɬ', 't͡ʃ', 't͡ʃʲ', 't͡ʃʼ', 't͡ʃː', 'u', 'uə', 'uː', 'u͡w', 'v', 'vʲ', 'vʷ', 'vː', 'v̞', 'v̞ʲ', 'w', 'x', 'x̟ʲ', 'y', 'z', 'zj', 'zʲ', 'z̪', 'ä', 'æ', 'ç', 'çj', 'ð', 'ø', 'ŋ', 'ŋ̟', 'ŋ͡m', 'œ', 'œ̃', 'ɐ', 'ɐ̞', 'ɑ', 'ɑ̱', 'ɒ', 'ɓ', 'ɔ', 'ɔ̃', 'ɕ', 'ɕː', 'ɖ̤', 'ɗ', 'ə', 'ɛ', 'ɛ̃', 'ɟ', 'ɡ', 'ɡʲ', 'ɡ̤', 'ɡ̥', 'ɣ', 'ɣj', 'ɤ', 'ɤɐ̞', 'ɤ̆', 'ɥ', 'ɦ', 'ɨ', 'ɪ', 'ɫ', 'ɯ', 'ɯ̟', 'ɯ̥', 'ɰ', 'ɱ', 'ɲ', 'ɳ', 'ɴ', 'ɵ', 'ɸ', 'ɹ', 'ɹ̩', 'ɻ', 'ɻ̩', 'ɽ', 'ɾ', 'ɾj', 'ɾʲ', 'ɾ̠', 'ʀ', 'ʁ', 'ʁ̝', 'ʂ', 'ʃ', 'ʃʲː', 'ʃ͡ɣ', 'ʈ', 'ʉ̞', 'ʊ', 'ʋ', 'ʋʲ', 'ʌ', 'ʎ', 'ʏ', 'ʐ', 'ʑ', 'ʒ', 'ʒ͡ɣ', 'ʔ', 'ʝ', 'ː', 'β', 'β̞', 'θ', 'χ', 'ә', 'ḁ']
    # eng_phones = ['a', 'aː', 'b', 'd', 'd̠', 'e', 'eː', 'e̞', 'f', 'h', 'i', 'iː', 'j', 'k', 'kʰ', 'l', 'm', 'n', 'o', 'oː', 'p', 'pʰ', 'r', 's', 't', 'tʰ', 't̠', 'u', 'uː', 'v', 'w', 'x', 'z', 'æ', 'ð', 'øː', 'ŋ', 'ɐ', 'ɐː', 'ɑ', 'ɑː', 'ɒ', 'ɒː', 'ɔ', 'ɔː', 'ɘ', 'ə', 'əː', 'ɛ', 'ɛː', 'ɜː', 'ɡ', 'ɪ', 'ɪ̯', 'ɯ', 'ɵː', 'ɹ', 'ɻ', 'ʃ', 'ʉ', 'ʉː', 'ʊ', 'ʌ', 'ʍ', 'ʒ', 'ʔ', 'θ']
    
    # for phone in phones:
    #     if phone not in IPA2VISEME:
    #         print(phone)

    aimee = RobotFace(robot_name='aimee', tts_method='system', voice_id='com.apple.voice.premium.en-US.Zoe')
    # aimee.tts.list_voices()

    # nathan = RobotFace(robot_name='nathan', voice_id='Matthew')

    # # send_message(request)
    # while True:
    #     message = input("who will we make talk?: ")

    #     aimee.set_appearance({
    #         'background_color': '#cccccc',
    #         'eyeball_color': '#ffffff',
    #         'iris_color': '#43d932',
    #         'eye_size': 150,
    #         'eye_height': 80,
    #         'eye_separation': 400,
    #         'iris_size': 90,
    #         'pupil_scale': 0.8,
    #         'eye_shine': True,
    #         'eyelid_color': '#cccccc',
    #         'nose_color': '#9bbce0',
    #         'nose_vertical_position': 0,
    #         'nose_width': 0,
    #         'nose_height': 0,
    #         'mouth_color': '#222222',
    #         'mouth_width': 320,
    #         'mouth_height': 30,
    #         'mouth_thickness': 18,
    #         'brow_color': '#222222',
    #         'brow_width': 110,
    #         'brow_height': 120,
    #         'brow_thickness': 20
    #     })

    aimee.say('hey diva, did you remember to SLAY Today?', move_face=False)

    for i in range(10):
        aimee.set_component_offsets({
            'eyebrow_left': [0, -1*i, 0, -5, 0, 0],
            'eyebrow_right': [0, -1*i, 0, -5, 0, 0],
            'mouth_upper': [0, 0, 0, .5*i, 0, .5*i, 0, 0],
            'mouth_lower': [0, 0, 0, .5*i, 0, .5*i, 0, 0]
        })
        time.sleep(0.1)
    aimee.set_component_offsets({
        'eyebrow_left': [0, 0, 0, 0, 0, 0],
        'eyebrow_right': [0, 0, 0, 0, 0, 0],
        'mouth_upper': [0, 0, 0, 0, 0, 0, 0, 0],
        'mouth_lower': [0, 0, 0, 0, 0, 0, 0, 0]
    }, time=500)

    aimee.wait()