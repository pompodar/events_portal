// components/Modal.jsx
import React from 'react';

const OnSaveEventsModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed top-4 right-4 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-2">{message}</h2>
            </div>
        </div>
    );
};

export default OnSaveEventsModal;
