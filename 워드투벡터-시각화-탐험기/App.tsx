
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fetchRelatedWords } from './services/geminiService';
import type { RelatedWord } from './types';
import WordPlot from './components/WordPlot';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [targetWord, setTargetWord] = useState<string>('');
  const [relatedWords, setRelatedWords] = useState<RelatedWord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyExists, setApiKeyExists] = useState<boolean>(true);

  const plotContainerRef = useRef<HTMLDivElement>(null);
  const [plotDimensions, setPlotDimensions] = useState<{ width: number, height: number }>({ width: 600, height: 400 });

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyExists(false);
      setError("API 키가 설정되지 않았습니다. 어플리케이션을 실행하기 위해 API_KEY 환경 변수를 설정해주세요.");
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (plotContainerRef.current) {
        const width = Math.min(plotContainerRef.current.offsetWidth - 40, 800); // Max width 800, with padding
        const height = Math.max(width * 0.6, 300); // Maintain aspect ratio, min height 300
        setPlotDimensions({ width, height });
      }
    };

    handleResize(); // Initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleFetchWords = useCallback(async () => {
    if (!targetWord.trim()) {
      setError('분석할 단어를 입력해주세요.');
      setRelatedWords([]);
      return;
    }
    if (!apiKeyExists) {
      setError("API 키가 설정되지 않았습니다. 계속 진행할 수 없습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRelatedWords([]);

    try {
      const words = await fetchRelatedWords(targetWord.trim());
      setRelatedWords(words);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || '단어 관계 분석 중 오류가 발생했습니다.');
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      setRelatedWords([]);
    } finally {
      setIsLoading(false);
    }
  }, [targetWord, apiKeyExists]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleFetchWords();
  };

  if (!apiKeyExists && error) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg text-center">
          <h1 className="text-3xl font-bold text-sky-700 mb-6">워드투벡터 시각화 탐험기</h1>
          <ErrorMessage message={error} />
          <p className="text-slate-600 mt-4">
            이 애플리케이션을 사용하려면 <code className="bg-slate-200 px-1 rounded">API_KEY</code> 환경 변수가 필요합니다.
            관리자에게 문의하거나 설정을 확인해주세요.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-100 p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-sky-700">워드투벡터 시각화 탐험기</h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          단어를 입력하고 관련된 단어들이 좌표 평면에서 어떻게 분포하는지 살펴보세요!
        </p>
      </header>

      <main className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <input
            type="text"
            value={targetWord}
            onChange={(e) => setTargetWord(e.target.value)}
            placeholder="예: '인공지능'"
            className="flex-grow p-3 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out text-base"
            disabled={isLoading || !apiKeyExists}
          />
          <button
            type="submit"
            disabled={isLoading || !targetWord.trim() || !apiKeyExists}
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '분석 중...' : '분석하기'}
          </button>
        </form>

        {error && <ErrorMessage message={error} />}

        <div ref={plotContainerRef} className="w-full min-h-[350px] sm:min-h-[450px] md:min-h-[500px] flex justify-center items-center border border-slate-200 rounded-lg bg-slate-50 p-2">
          {isLoading && <LoadingSpinner />}
          {!isLoading && !error && relatedWords.length === 0 && (
            <p className="text-slate-500 text-center">
              분석할 단어를 입력하고 '분석하기' 버튼을 눌러주세요.
              <br />
              예시: 학교, 사랑, 컴퓨터
            </p>
          )}
          {!isLoading && relatedWords.length > 0 && (
             <WordPlot data={relatedWords} width={plotDimensions.width} height={plotDimensions.height} targetWord={targetWord}/>
          )}
        </div>
      </main>

      <footer className="w-full max-w-4xl mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Word2Vec Visual Explorer. For educational purposes.</p>
      </footer>
    </div>
  );
};

export default App;
