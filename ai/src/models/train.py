import numpy as np
import json
import os
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from transformers import BertTokenizer, BertModel
from sklearn.preprocessing import LabelEncoder

from .model import NeuralNet

# 1. Load Data and Preprocessing
# Use absolute path to be independent of where the script is run
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(script_dir, '..', '..', '..')
intents_file_path = os.path.join(project_root, 'ai', 'data', 'raw', 'intents.json')

with open(intents_file_path, 'r', encoding='utf-8') as f:
    intents = json.load(f)

all_words = []
tags = []
xy = []
for intent in intents['intents']:
    tag = intent['tag']
    tags.append(tag)
    for pattern in intent['patterns']:
        xy.append((pattern, tag))

tags = sorted(list(set(tags)))

# 2. Tokenization and Encoding
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = BertModel.from_pretrained('bert-base-uncased')
label_encoder = LabelEncoder()
y_train = label_encoder.fit_transform([tag for _, tag in xy])

X_train_sentences = [sentence for sentence, _ in xy]
X_train_embeddings = []

print("Encoding sentences... This might take a while.")
with torch.no_grad():
    for sentence in X_train_sentences:
        inputs = tokenizer(sentence, return_tensors='pt', truncation=True, padding=True, max_length=128)
        outputs = bert_model(**inputs)
        # Use the embedding of the [CLS] token
        X_train_embeddings.append(outputs.last_hidden_state[0, 0, :].numpy())

X_train = np.array(X_train_embeddings)

# 3. Create Dataset
class ChatDataset(Dataset):
    def __init__(self):
        self.n_samples = len(X_train)
        self.x_data = X_train
        self.y_data = y_train

    def __getitem__(self, index):
        return self.x_data[index], self.y_data[index]

    def __len__(self):
        return self.n_samples

# 4. Training
def train():
    # Hyper-parameters 
    batch_size = 8
    hidden_size = 128
    input_size = len(X_train[0]) # 768 for bert-base-uncased
    output_size = len(tags)
    learning_rate = 0.001
    num_epochs = 100

    dataset = ChatDataset()
    train_loader = DataLoader(dataset=dataset,
                              batch_size=batch_size,
                              shuffle=True,
                              num_workers=0)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    model = NeuralNet(input_size, hidden_size, output_size).to(device)

    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

    # Train the model
    for epoch in range(num_epochs):
        for (words, labels) in train_loader:
            words = words.to(device)
            labels = labels.to(dtype=torch.long).to(device)
            
            # Forward pass
            outputs = model(words)
            loss = criterion(outputs, labels)
            
            # Backward and optimize
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
        if (epoch+1) % 10 == 0:
            print (f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')


    print(f'final loss: {loss.item():.4f}')

    # Save the model and related data
    data = {
    "model_state": model.state_dict(),
    "input_size": input_size,
    "hidden_size": hidden_size,
    "output_size": output_size,
    "tags": tags,
    "tokenizer_name": 'bert-base-uncased',
    "label_encoder": label_encoder
    }

    output_dir = os.path.join(project_root, 'ai', 'data', 'processed')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    FILE = os.path.join(output_dir, "trained_model.pth")
    torch.save(data, FILE)

    print(f'Training complete. File saved to {FILE}')

if __name__ == '__main__':
    train()
