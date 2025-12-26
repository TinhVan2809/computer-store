import random
import json
import torch
import numpy as np
import sys
import os

# Add the project root to the Python path to resolve the module import error
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ai.src.models.model import NeuralNet
from transformers import BertTokenizer, BertModel

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Use absolute paths to be independent of where the script is run
intents_file_path = os.path.join(project_root, 'ai', 'data', 'raw', 'intents.json')
with open(intents_file_path, 'r', encoding='utf-8') as json_data:
    intents = json.load(json_data)

model_file_path = os.path.join(project_root, 'ai', 'data', 'processed', 'trained_model.pth')
try:
    # Set weights_only=False as we are loading a LabelEncoder object besides the model weights.
    # This is safe since we are loading a file we created ourselves.
    data = torch.load(model_file_path, weights_only=False)
except FileNotFoundError:
    print("ERROR: trained_model.pth not found. Please run train.py first.")
    sys.exit(1)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
tags = data["tags"]
model_state = data["model_state"]
tokenizer_name = data["tokenizer_name"]
label_encoder = data["label_encoder"]

tokenizer = BertTokenizer.from_pretrained(tokenizer_name)
bert_model = BertModel.from_pretrained(tokenizer_name).to(device)

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = "Sam"
print("Let's chat! (type 'quit' to exit)")
while True:
    sentence = input("You: ")
    if sentence == "quit":
        break

    # Preprocess the input sentence
    with torch.no_grad():
        inputs = tokenizer(sentence, return_tensors='pt', truncation=True, padding=True, max_length=128).to(device)
        outputs = bert_model(**inputs)
        sentence_embedding = outputs.last_hidden_state[0, 0, :].unsqueeze(0)

    # Get model prediction
    output = model(sentence_embedding)
    _, predicted = torch.max(output, dim=1)

    tag = label_encoder.inverse_transform([predicted.item()])[0]

    # Check probability
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]

    # If probability is high enough, respond
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                print(f"{bot_name}: {random.choice(intent['responses'])}")
                break
    else:
        print(f"{bot_name}: I do not understand...")
