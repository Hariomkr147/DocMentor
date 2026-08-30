from pathlib import Path

Path('data').mkdir(exist_ok=True)
Path('data/sample_notes.txt').write_text('Gradient descent is an optimization algorithm that updates model parameters in the direction that reduces the loss. The learning rate controls the step size. Backpropagation computes gradients using the chain rule.', encoding='utf-8')
print('Created data/sample_notes.txt')
