import React, { useState } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  Bot, 
  HelpCircle,
  Book,
  Mail,
  Phone,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const FAQ_ITEMS = [
  {
    question: "How do I scan a product?",
    answer: "Navigate to the scanner page and point your camera at the product's barcode. The app will automatically detect and scan it."
  },
  {
    question: "Why isn't my barcode scanning?",
    answer: "Make sure the barcode is well-lit and not damaged. Try moving your camera closer or further away to get a clear focus."
  },
  {
    question: "How accurate are authenticity scores?",
    answer: "Our authenticity scores are based on multiple factors including seller reputation, product images, and pricing patterns. While highly accurate, always use your judgment."
  },
  {
    question: "Can I use the app offline?",
    answer: "Yes! The app works offline and will sync your data when you're back online. You can view cached products and your wishlist."
  },
  {
    question: "How do price alerts work?",
    answer: "Add items to your wishlist and set target prices. You'll get notifications when prices drop to or below your target."
  }
];

const QUICK_ACTIONS = [
  { icon: Book, label: "User Guide", action: "guide" },
  { icon: Mail, label: "Email Support", action: "email" },
  { icon: Phone, label: "Report Bug", action: "bug" }
];

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('faq');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm here to help. What can I assist you with today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your question. Let me help you with that!",
        "That's a great question! Here's what you need to know:",
        "I can help you with that. Let me provide some information:",
        "Thanks for reaching out! Here's how I can assist:",
      ];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'guide':
        window.open('/help/guide', '_blank');
        break;
      case 'email':
        window.location.href = 'mailto:support@shopscanner.com';
        break;
      case 'bug':
        window.open('/help/report-bug', '_blank');
        break;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Help & Support</h3>
              <p className="text-primary-100 text-sm">We're here to help!</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-primary-500 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4 bg-primary-500 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'faq'
                ? 'bg-white text-primary-600'
                : 'text-primary-100 hover:text-white'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'chat'
                ? 'bg-white text-primary-600'
                : 'text-primary-100 hover:text-white'
            }`}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-96 overflow-hidden flex flex-col">
        {activeTab === 'faq' ? (
          <div className="flex-1 overflow-y-auto">
            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_ACTIONS.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors"
                  >
                    <action.icon className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-xs text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Items */}
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Frequently Asked Questions</h4>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item, index) => (
                  <details key={index} className="group">
                    <summary className="cursor-pointer p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {item.question}
                      </span>
                    </summary>
                    <div className="mt-2 p-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 p-2 rounded-full ${
                    message.isUser ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    {message.isUser ? (
                      <User className="h-4 w-4 text-primary-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className={`flex-1 ${message.isUser ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-xs p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <div className="flex items-center mt-1 space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 rounded-full bg-gray-100">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}