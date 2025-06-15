from transformers import pipeline

class QAService:
    def __init__(self):
        self.qa_model = pipeline("question-answering", model="deepset/roberta-base-squad2")

    def generate_answer(self, question: str, context: str) -> str:
        # Split context into smaller segments if too large for the model
        max_context_length = 512  # RoBERTa's typical max token length
        context_segments = [context[i:i + max_context_length] for i in range(0, len(context), max_context_length)]
        
        best_answer = "Answer not present!"
        best_score = 0.0
        
        # Try each segment to find the best answer
        for segment in context_segments:
            result = self.qa_model(question=question, context=segment)
            if result["score"] > best_score:
                best_score = result["score"]
                best_answer = result["answer"]
        
        # Lower the threshold for rejecting answers
        if best_score < 0.05:  # Reduced from 0.1 to 0.05
            return "Answer not present!"
        
        return best_answer