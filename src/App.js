import React, { useState, useEffect, useRef } from 'react';
import { Transition } from '@headlessui/react';
import './App.css';
import newchat from './images/new.png'
import logo from './images/chatbot.png';

const Pika = () => {
  const [messages, setMessages] = useState([]);
  const [botTyping, setBotTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true); // State to control typewriter effect
  const [userSentMessage, setUserSentMessage] = useState(false); // State to track if user sent message
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);
  const API_KEY = 'd02a28c8-d88a-4695-9946-b2cbbde7f086';
  const greetingMessage = "Hey! I'm Pika. Ready to define your words.";

  useEffect(() => {
    // Trigger typewriter effect when component mounts
    setShowGreeting(true);
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userInput = e.target.userInput.value;
    setMessages([...messages, { text: userInput, sender: 'user' }]);
    setBotTyping(true);
    e.target.userInput.value = '';
    setUserSentMessage(true); // Set userSentMessage to true after sending message

    try {
      const botResponse = await getBotResponse(userInput);
      setMessages(prevMessages => [...prevMessages, { text: 'typing...', sender: 'bot' }]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      let typedMessage = '';
      for (let i = 0; i < botResponse.length; i++) {
        typedMessage += botResponse[i];
        setMessages(prevMessages => [...prevMessages.slice(0, -1), { text: typedMessage, sender: 'bot' }]);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
    } finally {
      setBotTyping(false);
    }
  };

  const getBotResponse = async (userInput) => {
    try {
      const response = await fetch(`https://dictionaryapi.com/api/v3/references/collegiate/json/${userInput}?key=${API_KEY}`);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0 && data[0].shortdef) {
        const definition = data[0].shortdef[0];
        return `${definition}`;
      } else {
        return `No definition found for "${userInput}".`;
      }
    } catch (error) {
      console.error('Error finding definition:', error);
      return 'Sorry, I encountered an error while finding the definition.';
    }
  };

  const handleNewChatClick = () => {
    window.location.reload(); // Reload the page
  };

  return (
    <div className="virtual-girlfriend flex flex-col h-screen bg-slate-900 text-white">
      <button onClick={handleNewChatClick} className='font-medium h-10 w-full flex items-center pl-3 pt-3'>
        <img className='w-5' src={newchat} alt='logo'></img>
        <span className="ml-2 text-sm hover:text-slate-200">New chat</span>
      </button>

      {showGreeting && !userSentMessage && ( // Render logo and greeting message only if not sent message
        <div className="flex flex-col justify-center items-center mb-1 mt-20 sm:mt-5">
          <img className='w-20 mt-32 mb-5 sm:w-32' src={logo} alt='logo'></img>
          <div id='greetingText' className='font-semibold text-base sm:text-xl'>
            {showGreeting && (
              <Typewriter text={greetingMessage}  />
            )}
          </div>
        </div>
      )}
      <div ref={chatWindowRef} className="chat-window flex-1 overflow-y-auto mt-10">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === 'bot' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-slate-500'} mb-2 mx-4 p-2 rounded-lg shadow-md max-w-xs break-words ${message.sender === 'bot' ? 'self-start' : 'self-end'}`}>
            {message.text}
          </div>
        ))}
        <Transition
          show={botTyping}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
        </Transition>
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center mx-4 pb-5">
        <input type="text" name="userInput" ref={inputRef} placeholder="Type your word..." className="flex-1 mb-10 px-4 py-2 rounded-l-lg  focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-slate-200" />
        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-r-lg  focus:outline-none mb-10">Send</button>
      </form>
    </div>
  );
};

// Component for typewriter effect
const Typewriter = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayText(text.substring(0, index));
      setIndex(prevIndex => prevIndex + 1);
    }, 20); // Adjust the speed of typing

    return () => clearTimeout(timer);
  }, [index, text]);

  return <>{displayText}</>;
};

export default Pika;
