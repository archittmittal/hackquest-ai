from sentence_transformers import SentenceTransformer
import numpy as np

class VectorEngine:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        # This model is small (80MB) and perfect for 4-day MVPs
        self.model = SentenceTransformer(model_name)

    def get_embedding(self, text: str):
        """Converts text into a 384-dimensional vector."""
        return self.model.encode(text).tolist()

    def calculate_similarity(self, vector_a, vector_b):
        """Calculates how close a dev's skill is to a problem statement."""
        return np.dot(vector_a, vector_b) / (np.linalg.norm(vector_a) * np.linalg.norm(vector_b))

vector_engine = VectorEngine()