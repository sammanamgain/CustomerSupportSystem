from flask import Flask, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from flask_cors import CORS

import pandas as pd
from sklearn.preprocessing import LabelEncoder
from transformers import pipeline
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import os

if not os.path.exists('audio'):
    os.makedirs('audio')


y = ['contact_customer_service',
 'delivery_period',
 'change_order',
 'newsletter_subscription',
 'delivery_options',
 'check_invoice',
 'contact_human_agent',
 'track_order',
 'review',
 'check_payment_methods',
 'complaint',
 'get_refund',
 'change_shipping_address',
 'cancel_order',
 'check_cancellation_fee',
 'place_order',
 'check_refund_policy',
 'recover_password',
 'set_up_shipping_address',
 'switch_account',
 'create_account',
 'get_invoice',
 'payment_issue',
 'track_refund',
 'delete_account',
 'registration_problems',
 'edit_account']

le_intent = LabelEncoder()
le_intent.fit(y)

model_name = 'sammanamgain/customer_intent_classifier'
intent_classifier = pipeline('text-classification', model=model_name, tokenizer=model_name, device=0 if torch.cuda.is_available() else -1)

tokenizer = AutoTokenizer.from_pretrained("sammanamgain/callcenter_response")
model = AutoModelForCausalLM.from_pretrained("sammanamgain/callcenter_response")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

def predict_intent(text, category):
    combined_text = f"{category} [SEP] {text}"
    prediction = intent_classifier(combined_text)
    predicted_class = prediction[0]['label']
    return le_intent.inverse_transform([int(predicted_class.split('_')[-1])])[0]

def generate_response(history, category, intent):
    input_text = f"{history} {category} {intent} [SEP]"
    print("input_text",input_text)
    inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True).to("cuda")
    model.config.pad_token_id = model.config.eos_token_id
    generated_ids = model.generate(
        inputs['input_ids'],
        attention_mask=inputs['attention_mask'],
        max_new_tokens=200,
        do_sample=True,
        top_k=50,
        top_p=0.95,
        temperature=0.7,
        pad_token_id=model.config.eos_token_id
    )
    result = tokenizer.decode(generated_ids[0], skip_special_tokens=True)
    
    response = result.split('[SEP]')[-1].strip()
    return response

uri = "mongodb+srv://samman:samman@cluster0.bbq0swn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
app = Flask(__name__)
CORS(app)

db = client['chat_database']
messages_collection = db['message']

@app.route('/api/clear-messages', methods=['DELETE'])
def clear_messages():
    category = request.args.get('category')
    try:
        result = messages_collection.delete_many({"category": category})
        return jsonify({"message": f"Deleted {result.deleted_count} messages."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload-audio', methods=['POST'])
def upload_audio():

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']

    import assemblyai as aai

    aai.settings.api_key = "4585e5f674ca4ab5996c1d007f7fc6d0"
    transcriber = aai.Transcriber()

    transcript = transcriber.transcribe(audio_file)



    

    
    return jsonify({"message": transcript.text}), 200

@app.route('/', methods=['GET'])
def home():
    try:
        messages = messages_collection.find_one()
        return jsonify(message=f"Connected to MongoDB. Document count: {messages}"), 200
    except Exception as e:
        print(e)
        return jsonify(error="Failed to connect to database"), 500

@app.route('/api/send-message', methods=['POST'])
def send_message():
    data = request.get_json()
    user_id = data.get('user_id')
    message = data.get('message')

    category = data.get('paramValue')
    history = ''
    if not user_id or not message:
        return jsonify({"error": "Invalid input"}), 400
    
    conversation = list(messages_collection.find({"user_id": user_id, "category": category}))
    if conversation:
        for entry in conversation:
            history += f"prompt: {entry['message']} response: {entry['response']}"
    history += f"  prompt:{message}"

    intent = predict_intent(message, category)
    response = generate_response(history, category, intent)
    messages_collection.insert_one({
        "user_id": user_id,
        "category": category,
        "message": message,
        "response": response
    })
    return jsonify({"message": response}), 200

@app.route('/api/get-conversation', methods=['GET'])
def get_conversation():
    try:
        user_id = request.args.get('user_id')
        category = request.args.get('category')
        conversation = list(messages_collection.find({"category": category}))
        if not conversation:
            return jsonify([{"user_id": 1, "message": "", "timestamp": "1002-2-2 "}]), 200
        messages = [
            {"sender": "user", "message": entry["message"], "timestamp": entry["_id"].generation_time}
            for entry in conversation
        ] + [
            {"sender": "bot", "message": entry["response"], "timestamp": entry["_id"].generation_time}
            for entry in conversation
        ]
        messages.sort(key=lambda x: x["timestamp"])
        return jsonify({"messages": messages}), 200
    except Exception as e:
        return jsonify([{"user_id": 1, "message": "hehe i love you", "timestamp": "1002-2-2 "}]), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
