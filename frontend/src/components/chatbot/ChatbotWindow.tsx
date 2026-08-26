import React, { useState, useRef, useEffect } from 'react';
import { ChatbotHeader } from './ChatbotHeader';
import { ChatMessage, type MessageItem } from './ChatMessage';
import { TopicSelector } from './TopicSelector';
import { QuestionSelector } from './QuestionSelector';
import { SatisfactionPrompt } from './SatisfactionPrompt';
import { ContactSupportPrompt } from './ContactSupportPrompt';
import { ChatbotInput } from './ChatbotInput';
import {
  type ChatTopic,
  type ChatQuestion,
  matchQuestionInKnowledgeBase,
} from '../../data/chatbotKnowledge';

interface ChatbotWindowProps {
  onClose: () => void;
}

type ChatFlowState =
  | 'SELECT_TOPIC'
  | 'SELECT_QUESTION'
  | 'OTHERS_INPUT'
  | 'AWAIT_SATISFACTION'
  | 'NO_MATCH_SUPPORT'
  | 'GOODBYE';

export const ChatbotWindow: React.FC<ChatbotWindowProps> = ({ onClose }) => {
  const initialGreeting: MessageItem = {
    id: 'welcome-msg',
    sender: 'bot',
    text: 'Namaste! Welcome to SAMBHAV Guide. How can I assist you today? Please choose a topic below or type a custom question.',
  };

  const [messages, setMessages] = useState<MessageItem[]>([initialGreeting]);
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic | null>(null);
  const [flowState, setFlowState] = useState<ChatFlowState>('SELECT_TOPIC');
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat on new messages or state transitions
  const scrollToBottom = () => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, flowState]);

  // Step 1: User selects a topic
  const handleSelectTopic = (topic: ChatTopic) => {
    setSelectedTopic(topic);
    if (topic.id === 'others') {
      setFlowState('OTHERS_INPUT');
      setMessages((prev) => [
        ...prev,
        {
          id: `topic-${Date.now()}`,
          sender: 'user',
          text: `Topic: ${topic.name}`,
        },
        {
          id: `bot-others-${Date.now()}`,
          sender: 'bot',
          text: 'You can type any question below. I will search our comprehensive ISL knowledge base for you!',
        },
      ]);
    } else {
      setFlowState('SELECT_QUESTION');
      setMessages((prev) => [
        ...prev,
        {
          id: `topic-${Date.now()}`,
          sender: 'user',
          text: `Topic: ${topic.name}`,
        },
        {
          id: `bot-prompt-${Date.now()}`,
          sender: 'bot',
          text: `Here are frequently asked questions regarding "${topic.name}". Please pick one:`,
        },
      ]);
    }
  };

  // Step 2: User selects a predefined question
  const handleSelectQuestion = (q: ChatQuestion) => {
    const userMsg: MessageItem = {
      id: `user-q-${Date.now()}`,
      sender: 'user',
      text: q.question,
    };

    const botMsg: MessageItem = {
      id: `bot-ans-${Date.now()}`,
      sender: 'bot',
      text: q.answer,
      actionLabel: q.actionLabel,
      actionRoute: q.actionRoute,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setFlowState('AWAIT_SATISFACTION');
  };

  // Step 2b: User submits custom query in Others mode
  const handleCustomQuestionSubmit = (queryText: string) => {
    const userMsg: MessageItem = {
      id: `user-custom-${Date.now()}`,
      sender: 'user',
      text: queryText,
    };

    const matched = matchQuestionInKnowledgeBase(queryText);

    if (matched) {
      const botMsg: MessageItem = {
        id: `bot-matched-${Date.now()}`,
        sender: 'bot',
        text: `Here is what I found for "${matched.question}":\n\n${matched.answer}`,
        actionLabel: matched.actionLabel,
        actionRoute: matched.actionRoute,
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setFlowState('AWAIT_SATISFACTION');
    } else {
      const botFailMsg: MessageItem = {
        id: `bot-fail-${Date.now()}`,
        sender: 'bot',
        text: `I could not find a direct match for "${queryText}" in our predefined knowledge base.`,
      };
      setMessages((prev) => [...prev, userMsg, botFailMsg]);
      setFlowState('NO_MATCH_SUPPORT');
    }
  };

  // Step 3: Back to topics selector
  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setFlowState('SELECT_TOPIC');
  };

  // Step 4: Ask another question / Try again
  const handleAskAnotherQuestion = () => {
    setSelectedTopic(null);
    setFlowState('SELECT_TOPIC');
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-another-${Date.now()}`,
        sender: 'bot',
        text: 'Sure! Please choose another topic or search for a question below:',
      },
    ]);
  };

  // Step 5: End Chat
  const handleEndChat = () => {
    setFlowState('GOODBYE');
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-bye-${Date.now()}`,
        sender: 'bot',
        text: 'Thank you for using SAMBHAV Guide! Wishing you an empowering accessibility experience. Have a wonderful day!',
      },
    ]);

    setTimeout(() => {
      handleReset();
      onClose();
    }, 2200);
  };

  // Reset chat state to initial
  const handleReset = () => {
    setSelectedTopic(null);
    setFlowState('SELECT_TOPIC');
    setMessages([initialGreeting]);
  };

  return (
    <div
      className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[410px] h-[570px] max-h-[80vh] bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex flex-col z-50 overflow-hidden font-['Inter',sans-serif] animate-slideUp backdrop-blur-xl"
      role="dialog"
      aria-label="SAMBHAV Guide Chatbot"
    >
      {/* Header */}
      <ChatbotHeader onClose={onClose} onReset={handleReset} />

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 custom-scrollbar">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Dynamic Controls based on flow state */}
        <div className="pt-1">
          {flowState === 'SELECT_TOPIC' && (
            <TopicSelector onSelectTopic={handleSelectTopic} />
          )}

          {flowState === 'SELECT_QUESTION' && selectedTopic && (
            <QuestionSelector
              topic={selectedTopic}
              onSelectQuestion={handleSelectQuestion}
              onBackToTopics={handleBackToTopics}
            />
          )}

          {flowState === 'OTHERS_INPUT' && (
            <ChatbotInput
              onSubmit={handleCustomQuestionSubmit}
              onBackToTopics={handleBackToTopics}
            />
          )}

          {flowState === 'AWAIT_SATISFACTION' && (
            <SatisfactionPrompt
              onAskAnotherQuestion={handleAskAnotherQuestion}
              onEndChat={handleEndChat}
            />
          )}

          {flowState === 'NO_MATCH_SUPPORT' && (
            <ContactSupportPrompt
              onTryAnotherQuestion={handleAskAnotherQuestion}
              onEndChat={handleEndChat}
            />
          )}

          {flowState === 'GOODBYE' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-xs font-bold text-emerald-800 dark:text-[#8dfc75] animate-fadeIn flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Session ended. Have a great day!</span>
            </div>
          )}
        </div>

        <div ref={scrollEndRef} />
      </div>
    </div>
  );
};
