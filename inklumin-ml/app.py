from flask import Flask, request, jsonify
import pymorphy3
from flask_cors import CORS, cross_origin

from analyzers.clishes.clishe_analyzer import get_cliched_matches
from analyzers.repeats.word_repeat_analyzer import get_word_repeats
from generators.case_generator import generate_phrase_cases

app = Flask(__name__)
morph = pymorphy3.MorphAnalyzer()
cors = CORS(app)

@app.route('/get_cases', methods=['POST'])
@cross_origin()
def parse_phrase():
  # Проверяем входные данные
  data = request.get_json()
  if not data or 'phrase' not in data:
    return jsonify({'error': 'Missing phrase parameter'}), 400

  phrase = data['phrase']
  result = generate_phrase_cases(phrase)

  return jsonify(result)




@app.route('/find_repeats', methods=['POST'])
@cross_origin()
def find_repeats():
  # Проверяем входные данные
  data = request.get_json()
  if not data or 'text' not in data:
    return jsonify({'error': 'Missing text parameter'}), 400

  text = data['text']
  window_size = data.get('window_size', len(text))  # Для обычных слов
  window_size_tech_words = data.get('window_size_tech_words', window_size)  # Для предлогов/союзов

  repeat_data = get_word_repeats(text, window_size, window_size_tech_words)

  return jsonify({
    'repeatData': repeat_data,
  })


@app.route('/analyze_cliches', methods=['POST'])
@cross_origin()
def analyze_cliches():
  # Проверяем входные данные
  data = request.get_json()
  if not data or 'text' not in data:
    return jsonify({'error': 'Missing text parameter'}), 400

  text = data['text']

  data = get_cliched_matches(text)

  return jsonify({
    'data': data,
  })


if __name__ == '__main__':
  app.run(debug=False, port=5123, host="0.0.0.0")
