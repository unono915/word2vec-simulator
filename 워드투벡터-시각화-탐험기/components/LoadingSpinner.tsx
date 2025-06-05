
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col justify-center items-center py-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-sky-600"></div>
    <p className="mt-3 text-sky-700 font-semibold">단어 관계를 분석 중입니다...</p>
  </div>
);

export default LoadingSpinner;
