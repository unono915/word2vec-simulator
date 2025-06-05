
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-sm" role="alert">
    <p><strong className="font-semibold">오류 발생:</strong> {message}</p>
  </div>
);

export default ErrorMessage;
