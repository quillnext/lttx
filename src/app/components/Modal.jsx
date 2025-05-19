import React from 'react'

const Modal = ({ isOpen, onClose, type, message }) => {
    if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 text-center shadow-lg relative max-w-sm w-full">
      <div
        className={`w-16 h-16 rounded-full flex justify-center items-center mx-auto mb-4 ${
          type === "success" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"
        }`}
      >
        <span className="text-4xl">{type === "success" ? "✔" : "✖"}</span>
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">
        {type === "success" ? "Success!" : "Oops!"}
      </h3>
      <p className="text-primary mb-4">{message}</p>
      <button
        onClick={onClose}
        className={`px-6 py-2 rounded-full text-white ${
          type === "success" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {type === "success" ? "Done" : "Try again"}
      </button>
    </div>
  </div>
  )
}

export default Modal