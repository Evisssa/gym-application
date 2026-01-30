import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
      <div className="bg-surface p-8 rounded-lg shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text hover:text-primary">
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
