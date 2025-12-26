# main entry point for training
import sys
import os

# Add the project root to the Python path to resolve the module import error
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ai.src.models.train import train

if __name__ == '__main__':
    # Create directory if it doesn't exist
    if not os.path.exists('ai/data/processed'):
        os.makedirs('ai/data/processed')
    print("Starting training process...")
    train()
