import React, { useState } from 'react';
import { ChatbotButton } from './ChatbotButton';
import { ChatbotWindow } from './ChatbotWindow';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatbotButton isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
      {isOpen && <ChatbotWindow onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default Chatbot;
