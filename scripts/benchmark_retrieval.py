from backend.app.main import store

questions = [('What controls the step size?', 'learning rate'), ('How are gradients computed?', 'backpropagation')]
for question, expected in questions:
    hits = store.search(question, 5)
    print({'question': question, 'hit': any(expected in h['text'].lower() for h in hits), 'top_k': 5})
