import json

def load_intents(filepath='ai/data/raw/intents.json'):
    """
    Loads the intents file for the chatbot.
    """
    with open(filepath, 'r') as f:
        return json.load(f)

if __name__ == '__main__':
    intents = load_intents()
    print(f"Loaded {len(intents['intents'])} intents.")
