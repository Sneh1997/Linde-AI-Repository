from flask import Flask, request, jsonify
import ollama

app = Flask(__name__)

@app.route('/generate-description', methods=['POST'])
def generate_description():
    data = request.json
    features = data.get('features', '')
    model = 'llama-3.2-3b-it'

    prompt = f"You are a product description generator. Write a compelling description for: {features}"

    response = ollama.chat(
        model=model,
        messages=[
            {'role': 'system', 'content': 'You are a product description generator.'},
            {'role': 'user', 'content': prompt}
        ]
    )

    return jsonify({'description': response['message']['content']})

if __name__ == '__main__':
    app.run(debug=True)
