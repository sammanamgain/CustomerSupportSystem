// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import CustomerCare from './CustomerCare';
import Chat from './Chat.tsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerCare />} />
        <Route path="/chat" element={<Chat/>} /> {/* Replace with your chat component */}
      </Routes>
    </Router>
  );
}

export default App;
