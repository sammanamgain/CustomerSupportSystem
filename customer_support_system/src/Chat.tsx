import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'flowbite-react';
import axios from 'axios';
import './chat.css'; // Import the CSS file
import { useLocation } from 'react-router-dom';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; message: string; timestamp: Date }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const query = useQuery();
  const paramValue = query.get('id');
  const [isAudioResponse, setIsAudioResponse] = useState(false);

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  useEffect(() => {
    axios.get(`http://192.168.1.94:5000/api/get-conversation?user_id=1&category=${paramValue}`)
      .then(response => {
        console.log("response", response.data.messages);
        setMessages(response.data.messages || []);
        scrollToBottom();
      })
      .catch(error => console.error("Error fetching conversation:", error));
  }, [paramValue]);

  const resetchat = () => {
    axios.delete(`http://192.168.1.94:5000/api/clear-messages?category=${paramValue}`)
      .then(response => {
        console.log("response", response.data.messages);
        setMessages([]);
      })
      .catch(error => console.error("Error clearing conversation:", error));
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const query = data.get('query') as string;

    if (query.trim()) {
      const userId = "exampleUserId"; 
      // Replace with actual user ID
  
      axios.post("http://192.168.1.94:5000/api/send-message", { user_id: userId, message: query, paramValue })
        .then(response => {
          setMessages(prevMessages => [
            ...prevMessages,
            { sender: "user", message: query, timestamp: new Date() },
            { sender: "bot", message: response.data.message, timestamp: new Date() }
          ]);
          setNewMessage("");
          scrollToBottom();

          if (isAudioResponse) {
            convertTextToAudio(response.data.message);
          }
        })
        .catch(error => console.error("Error sending message:", error));
    }
  };

  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setAudioBlob(audioBlob);
          audioChunksRef.current = [];
        };

        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch(error => console.error("Error accessing media devices.", error));
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSaveRecording = () => {
    setIsAudioResponse(true);

    const userId = "exampleUserId"; 
    if (audioBlob) {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      axios.post('http://192.168.1.94:5000/api/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        axios.post("http://192.168.1.94:5000/api/send-message", { user_id: userId, message: response.data.message, paramValue })
          .then(response1 => {
            setMessages(prevMessages => [
              ...prevMessages,
              { sender: "user", message: response.data.message, timestamp: new Date() },
              { sender: "bot", message: response1.data.message, timestamp: new Date() }
            ]);
            setNewMessage("");
            scrollToBottom();

            convertTextToAudio(response1.data.message);
          })
          .catch(error => console.error("Error sending message:", error));
        console.log('Audio uploaded successfully:', response.data);
      })
      .catch(error => {
        console.error('Error uploading audio:', error);
      });
    }
  };

  const convertTextToAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">customer care</span>
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <Button>Get started</Button>
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-sticky"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>
          </div>
          <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <a href="/" className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500" aria-current="page">Home</a>
              </li>
              <li>
                <a href="#" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">About</a>
              </li>
              <li>
                <a href="#" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Services</a>
              </li>
              <li>
                <a href="#" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <section className="input">
        <div className="heading">
          <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">AI driven</span> Customer Care
          </h1>
          <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Enter your query here with our advanced model</p>
          <Button type="submit" style={{ display: 'block', margin: '1rem auto' }} onClick={resetchat}>
            New Chat
          </Button>
        </div>
      </section>
      <section className="conversation">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <span>{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </section>

      <form onSubmit={handleSendMessage}>
        <textarea
          name="query"
          placeholder="Enter your prompts"
          className="textarea"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
        ></textarea>

        <Button 
          style={{ display: 'block', margin: '1rem auto' }}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
        >
          {isRecording ? 'Stop Recording' : 'Record Audio'}
        </Button>

        {audioBlob && (
          <div style={{ textAlign: 'center' }}>
            <audio controls src={URL.createObjectURL(audioBlob)} />
            <Button onClick={handleSaveRecording} style={{ display: 'block', margin: '1rem auto' }}>
              Save Recording
            </Button>
          </div>
        )}

        <Button type="submit" style={{ display: 'block', margin: '1rem auto' }} className='askai'>
          Ask AI
        </Button>
      </form>
    </div>
  );
};

export default Chat;
