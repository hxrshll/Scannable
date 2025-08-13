"use client";

import { useState, FormEvent } from 'react';
import Image from 'next/image';

interface ShortenResponse {
  shortUrl: string;
  qrUrl: string;
}

// Optimized inline SVG components
const CopyIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
    <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
  </svg>
);

const PrintIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7V9h6v3z" clipRule="evenodd" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortenResponse | null>(null);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const longUrl = formData.get('url') as string;

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: longUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to shorten URL');
      }

      const data: ShortenResponse = await response.json();
      setResult(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to shorten URL';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrint = () => {
      const printableArea = document.getElementById('printable-area');
      if (!printableArea) return;
      
      const originalContents = document.body.innerHTML;
      const printContents = `
          <div class="p-8 bg-white">
              <h1 class="text-2xl font-bold text-center mb-6 text-black">Your Short Link & QR Code</h1>
              ${printableArea.innerHTML}
          </div>
      `;
      
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
  };

  const handleCopyClick = (textToCopy: string, e: React.MouseEvent<HTMLButtonElement>) => {
      navigator.clipboard.writeText(textToCopy).then(() => {
          const button = e.currentTarget;
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          setTimeout(() => {
              button.textContent = originalText;
          }, 2000);
      }).catch(err => {
          console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="min-h-screen w-full text-slate-900">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-slate-50 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-slate-100 -z-10"></div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <main className="w-full max-w-2xl mx-auto space-y-8">
          <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold">Shorten & Share</h1>
            <p className="mt-2 text-lg text-slate-600">Create a compact link and a QR code in seconds.</p>
          </header>

                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200">
            <form id="shorten-form" onSubmit={handleFormSubmit}>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="url"
                  id="url-input"
                  name="url"
                  placeholder="Too long to remember? That’s why we’re here."
                  required
                  className="flex-1 px-4 py-3 text-lg bg-slate-100 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  type="submit"
                  id="submit-button"
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-semibold text-lg px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 active:scale-100 disabled:bg-blue-400 disabled:scale-100"
                >
                  {isLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    <span>Shorten</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div id="response-section">
            {result && (
              <div id="result-card" className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 text-center animate-fade-in">
                <h2 className="text-2xl font-bold mb-4">Your Link is Ready!</h2>
                <div className="mb-6">
                  <label className="font-semibold text-slate-600">Your Short URL</label>
                  <div className="mt-2 flex items-center justify-between bg-slate-100 p-3 rounded-lg">
                    <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium text-lg truncate pr-4">
                      {result.shortUrl.replace(/^https?:\/\//, '')}
                    </a>
                    <button onClick={(e) => handleCopyClick(result.shortUrl, e)} className="copy-button flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                      <CopyIcon />
                      Copy
                    </button>
                  </div>
                </div>
                <div id="printable-area" className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 border-t border-slate-200 pt-6 mt-6">
                  <div>
                    {/* --- FIX: Removed the redundant "QR Code" label --- */}
                    <div className="p-2 bg-white rounded-lg shadow-md border border-slate-200 inline-block">
                      <Image 
                        src={result.qrUrl} 
                        alt="QR Code for the shortened URL" 
                        width={160}
                        height={160}
                        className="rounded-md" 
                      />
                    </div>
                  </div>
                  <div className="sm:border-l sm:pl-8 border-slate-200 flex flex-col items-center justify-center gap-4">
                    <p className="text-slate-600 max-w-xs">Share, print, or save this QR code.</p>
                    <button onClick={handlePrint} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 transition">
                        <PrintIcon />
                      Print / Save PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div id="error-message" className="text-center bg-red-100 text-red-700 p-4 rounded-lg">
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </main>

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p className="flex items-center justify-center gap-1.5">
            Built with 
            <HeartIcon />
            and a bit of code.
          </p>
        </footer>
      </div>
      <style jsx global>{`
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border-left-color: #fff;
            animation: spin 1s ease infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
