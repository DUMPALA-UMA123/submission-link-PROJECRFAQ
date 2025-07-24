import React, { useState, useEffect, useRef } from 'react';

// Main App component for the AI-Powered FAQ Chatbot
function App() {
  // State to store chat messages (user and bot)
  const [messages, setMessages] = useState([]);
  // State to store the current input value in the message box
  const [inputValue, setInputValue] = useState('');
  // State to store unanswered queries for future improvement
  const [unansweredQueries, setUnansweredQueries] = useState([]);
  // State to control feedback prompt visibility
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  // State to store the ID of the last bot message for feedback
  const [lastAnsweredMessageId, setLastAnsweredMessageId] = useState(null);

  // Ref for auto-scrolling to the bottom of the chat
  const messagesEndRef = useRef(null);

  // Predefined FAQ data (questions and answers)
  // In a real application, this would come from a database or a more sophisticated NLP model.
  const faqs = [
    {
      keywords: ['hello', 'hi', 'hey', 'greetings'],
      answer: "Hello! How can I assist you today regarding our services?",
    },
    {
      keywords: ['services', 'offer', 'what do you do', 'provide'],
      answer: "We offer a wide range of services including product support, technical assistance, and general information about our company.",
    },
    {
      keywords: ['contact', 'support', 'reach out', 'phone', 'email'],
      answer: "You can contact our support team via email at support@example.com or call us at 1-800-123-4567 during business hours.",
    },
    {
      keywords: ['pricing', 'cost', 'how much', 'price'],
      answer: "Our pricing varies depending on the service. Please visit our 'Pricing' page on the website or contact sales for a detailed quote.",
    },
    {
      keywords: ['account', 'login', 'password', 'reset'],
      answer: "For account-related issues, please visit our 'Account Management' section or use the 'Forgot Password' link on the login page.",
    },
    {
      keywords: ['shipping', 'delivery', 'order status'],
      answer: "You can track your order status by logging into your account or by entering your order number on our 'Order Tracking' page.",
    },
    {
      keywords: ['return', 'refund', 'exchange'],
      answer: "Please refer to our 'Return Policy' page for detailed information on returns, refunds, and exchanges. Most items can be returned within 30 days.",
    },
    {
      keywords: ['features', 'product capabilities', 'what can it do'],
      answer: "Our product boasts features like real-time analytics, customizable dashboards, and seamless integration with popular tools. Visit our product page for more details!",
    },
    {
      keywords: ['security', 'data protection', 'safe'],
      answer: "We prioritize your data security with industry-standard encryption, regular audits, and strict privacy policies. Your information is safe with us.",
    },
    {
      keywords: ['payment methods', 'credit card', 'paypal',],
      answer: "We accept various payment methods including major credit cards (Visa, MasterCard, Amex), PayPal, and bank transfers.",
    },
  
  ];

  // Effect to scroll to the bottom of the chat window whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to handle sending a message
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return; // Don't send empty messages

    const userMessage = {
      id: Date.now(), // Unique ID for the message
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message

    // Process user input to find an answer
    const botResponse = getBotResponse(inputValue);

    // Simulate a slight delay for bot response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1, // Unique ID for bot message
        text: botResponse.answer,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isAnswered: botResponse.isAnswered, // Flag if a specific FAQ was answered
        feedback: null, // To store feedback (helpful/not helpful)
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]); // Add bot message
      setLastAnsweredMessageId(botMessage.id); // Set the ID for feedback
      setShowFeedbackPrompt(botResponse.isAnswered); // Show feedback only if answered
    }, 500); // 0.5 second delay

    setInputValue(''); // Clear input field
  };

  // Function to determine bot's response based on user input
  const getBotResponse = (query) => {
    const normalizedQuery = query.toLowerCase();
    let foundAnswer = false;
    let answer = "I'm sorry, I couldn't find an answer to that question. Could you please rephrase it or try a different query?";

    // Iterate through FAQs to find a match
    for (const faq of faqs) {
      const matched = faq.keywords.some((keyword) =>
        normalizedQuery.includes(keyword)
      );
      if (matched) {
        answer = faq.answer;
        foundAnswer = true;
        break; // Found a match, stop searching
      }
    }

    // If no answer found, log the query for future improvement
    if (!foundAnswer) {
      setUnansweredQueries((prevQueries) => [...prevQueries, query]);
    }

    return { answer, isAnswered: foundAnswer };
  };

  // Function to handle feedback from the user
  const handleFeedback = (messageId, feedbackType) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
      )
    );
    setShowFeedbackPrompt(false); // Hide feedback prompt after selection
  };

  // ChatBubble component to display individual messages
  const ChatBubble = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm break-words">{message.text}</p>
          <span
            className={`block text-xs mt-1 ${
              isUser ? 'text-blue-200' : 'text-gray-600'
            }`}
          >
            {message.timestamp}
          </span>
          {/* Display feedback status if available */}
          {message.sender === 'bot' && message.feedback && (
            <span
              className={`block text-xs mt-1 ${
                message.feedback === 'helpful' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              Feedback: {message.feedback === 'helpful' ? '👍 Helpful' : '👎 Not Helpful'}
            </span>
          )}
        </div>
      </div>
    );
  };

  // FeedbackButtons component for "Helpful" and "Not Helpful"
  const FeedbackButtons = ({ messageId, onFeedback }) => (
    <div className="flex justify-center mt-2 space-x-2">
      <button
        onClick={() => onFeedback(messageId, 'helpful')}
        className="px-4 py-2 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-colors duration-200 text-sm"
      >
        👍 Helpful
      </button>
      <button
        onClick={() => onFeedback(messageId, 'not helpful')}
        className="px-4 py-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors duration-200 text-sm"
      >
        👎 Not Helpful
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-4">
      <div className="flex flex-col w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden h-[80vh] md:h-[90vh]">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center text-xl font-bold rounded-t-xl shadow-md">
          AI FAQ Chatbot
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              Start by typing a question!
            </div>
          )}
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <ChatBubble message={msg} />
              {/* Show feedback buttons only for the last bot message that was an answer */}
              {msg.id === lastAnsweredMessageId && msg.sender === 'bot' && msg.isAnswered && showFeedbackPrompt && !msg.feedback && (
                <FeedbackButtons messageId={msg.id} onFeedback={handleFeedback} />
              )}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} /> {/* Scroll target */}
        </div>

        {/* Chat Input Area */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center space-x-3 rounded-b-xl">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your question here..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-gray-800"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* Display Unanswered Queries (for demonstration/debugging) */}
        {unansweredQueries.length > 0 && (
          <div className="p-4 bg-yellow-100 border-t border-yellow-200 text-sm text-yellow-800 rounded-b-xl mt-2">
            <h3 className="font-semibold mb-1">Unanswered Queries (for improvement):</h3>
            <ul className="list-disc list-inside">
              {unansweredQueries.map((query, index) => (
                <li key={index}>{query}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
