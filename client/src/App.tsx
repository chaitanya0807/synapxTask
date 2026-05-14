import { useState, useEffect } from "react";
import axios from "axios";
import UploadZone from "./components/UploadZone";
import ResultPanel from "./components/ResultPanel";

type ClaimResult = {
  extractedFields: Record<string, any>;
  missingFields: string[];
  recommendedRoute: "fast-track" | "manual-review" | "investigation-flag" | "specialist-queue";
  reasoning: string;
};

const STATUS_MESSAGES = [
  "Parsing document...",
  "Running Gemini extraction...",
  "Applying routing rules...",
];

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setStatusIndex(0);
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1500);
    return () => clearInterval(id);
  }, [loading]);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/process-claim`,
        formData,
        { timeout: 120000 }
      );
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top bar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h1 className="text-xl font-bold">FNOL Intelligence Agent</h1>
        </div>
        <div className="flex gap-2">
          {["React", "Python", "LangChain", "Gemini"].map((tech) => (
            <span key={tech} className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-400">{tech}</span>
          ))}
        </div>
      </header>

      {/* Error toast */}
      {error && (
        <div className="mx-auto max-w-3xl px-4 pt-4">
          <div className="bg-red-900 border border-red-700 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-red-200 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-3">✕</button>
          </div>
        </div>
      )}

      {/* Main area */}
      <main className="max-w-3xl mx-auto py-12 px-4">
        {loading ? (
          <div className="space-y-4">
            <div className="h-6 bg-gray-800 rounded animate-pulse w-3/4" />
            <div className="h-6 bg-gray-800 rounded animate-pulse w-1/2" />
            <div className="h-6 bg-gray-800 rounded animate-pulse w-2/3" />
            <p className="text-gray-500 text-sm mt-6">{STATUS_MESSAGES[statusIndex]}</p>
          </div>
        ) : !result ? (
          <UploadZone
            onSubmit={handleUpload}
            loading={loading}
            error={error}
          />
        ) : (
          <ResultPanel result={result} onReset={resetState} />
        )}
      </main>
    </div>
  );
}

export default App;
