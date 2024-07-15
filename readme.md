# Customer Support System

An automated customer support system leveraging AI technologies for efficient and accurate responses.

## Project Description

This project aims to automate the customer support process using advanced natural language processing techniques. Key features include:

- Intent classification using BERT (Bidirectional Encoder Representations from Transformers)
- Response generation using GPT-2 (Generative Pre-trained Transformer 2)
- Support for both text and audio input formats
- Seamless integration of frontend and backend components
- store the converstation history in mongodb database To maintain context across multiple interactions,

The system analyzes customer queries, determines the intent, and generates appropriate responses, enhancing the efficiency and accuracy of customer support interactions.

## Prerequisites

- Node.js (v14 or later) and npm
- Python 3.8 or later
- Git

## Installation

### Frontend Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/customer_support_system.git
   ```

2. Navigate to the project directory:
   ```
   cd customer_support_system
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the Flask backend directory:
   ```
   cd flask_css
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS and Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Start the Flask application:
   ```
   python app.py
   ```


## Usage

1. Ensure both frontend and backend servers are running.
2. Open a web browser and navigate to the address provided by the frontend development server (typically `http://localhost:3000`).
3. **Text Input:**
- Enter your query in the prompts box and click on "Ask AI".
- Wait for the response to be generated.
4. **Audio Input:**
- Click on the record button, record your voice query.
- Click on the stop button and then save the recording.
- Be patient as it takes time to generate the response.

## Architecture

- Frontend: React.js application for user interface
- Backend: Flask server handling AI processing
- AI Models:
  - BERT for intent classification
  - GPT-2 for response generation

## Contributing

We welcome contributions to improve the Customer Support System. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgements

- BERT model: [https://github.com/google-research/bert](https://github.com/google-research/bert)
- GPT-2 model: [https://github.com/openai/gpt-2](https://github.com/openai/gpt-2)





# add more instaruction
for text input 
write the input in enter your prompts box , click on ask ai , then wait ,response will be generated

for audio
click record button, record voice, click on stop button and click on save recording
be paitent as it takes much time to respond the answer
