# from TTS.api import TTS

# tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

# # generate speech by cloning a voice using default settings
# tts.tts_to_file(text="It took me quite a long time to develop a voice, and now that I have it I'm not going to be silent.",
#                 file_path="output2.wav",
#                 speaker_wav="./male.wav",
#                 language="en")

from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC 
from datasets import load_dataset
import torch
import soundfile as sf
import numpy as np

# load model and processor
processor = Wav2Vec2Processor.from_pretrained("vitouphy/wav2vec2-xls-r-300m-timit-phoneme")
model = Wav2Vec2ForCTC.from_pretrained("vitouphy/wav2vec2-xls-r-300m-timit-phoneme")

# Read and process the input
audio_input, sample_rate = sf.read("output.wav")

def chunk_with_overlap(arr, chunk_size, overlap):
    return [arr[i:i + chunk_size] for i in range(0, len(arr) - chunk_size + 1, overlap)]

audio_input = chunk_with_overlap(audio_input, int(sample_rate * .1), int(sample_rate * .05)) # chunk into 150 ms segments
audio_input = np.array(audio_input[:-1])
print(audio_input.shape)

inputs = processor(audio_input, sampling_rate=16_000, return_tensors="pt", padding=True)

print(inputs.input_values.shape)

with torch.no_grad():
    logits = model(inputs.input_values, attention_mask=inputs.attention_mask).logits

# Decode id into string
predicted_ids = torch.argmax(logits, axis=-1)      
predicted_sentences = processor.batch_decode(predicted_ids)

print(predicted_sentences)