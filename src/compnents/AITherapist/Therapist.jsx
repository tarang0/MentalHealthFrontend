import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Loader from 'react-js-loader';
import Navbar from '../navbar/Navbar';
import './Therapist.css';

const API_KEY = process.env.REACT_APP_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const TypingAnimation = ({ color }) => (
  <div className="item text-2xl">
    <Loader type="ping-cube" bgColor={color} color={color} size={100} />
  </div>
);

const Therapist = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


      const chat = model.startChat({
        history: updatedMessages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
      });

      const result = await chat.sendMessage(input);
      const response = await result.response;
      let aiMessage = await response.text();

      // Replace **bold** with plain (optional styling logic)
      aiMessage = aiMessage.replace(/\*\*(.*?)\*\*/g, '$1');

      // Simulate typing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessages((prev) => [...prev, { sender: 'ai', text: aiMessage }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'An error occurred while generating the response.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Navbar />
      <div className="therapist-container">
        <h1 className="heading">Your Personal AI Assistant</h1>
        <div ref={chatBoxRef} className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
              {msg.text}
            </div>
          ))}
          {loading && <TypingAnimation color="#007BFF" />}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="input-field"
          />
          <button onClick={handleSend} className="send-button bg-pink-100">Send</button>
        </div>
      </div>
    </>
  );
};

export default Therapist;
