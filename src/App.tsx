import React, { useState, useEffect } from 'react';
import { Sun, Moon, AlertCircle, CheckCircle, Loader2, Search } from 'lucide-react';
import Markdown from 'react-markdown';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [topic, setTopic] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [retries, setRetries] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState('');
  const [toasts, setToasts] = useState<{id: number, message: string, type: 'error' | 'success'}[]>([]);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const showToast = (message: string, type: 'error' | 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('Please enter a research topic.', 'error');
      return;
    }

    setIsLoading(true);
    setReport('');
    showToast('Agent started. Fetching data and processing...', 'success');

    try {
      const res = await fetch('/api/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, priority, retries })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to run agent');
      }
      
      setReport(data.report);
      showToast('Research complete!', 'success');
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${t.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'} animate-in slide-in-from-top-5`}>
            {t.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <p className="font-medium">{t.message}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              AM
            </div>
            <h1 className="text-xl font-bold tracking-tight">AgentMesh</h1>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-[350px_1fr] gap-8">
        
        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Research Configuration</h2>
            <form onSubmit={handleRunAgent} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Quantum Computing"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Priority</label>
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Max Retries</label>
                <input 
                  type="number" 
                  min="0"
                  max="5"
                  value={retries}
                  onChange={e => setRetries(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {isLoading ? 'Processing...' : 'Run Agent'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 min-h-[500px]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-4">
              <Loader2 size={48} className="animate-spin text-indigo-600" />
              <p>Agent is gathering data, paying nodes, and synthesizing report...</p>
            </div>
          ) : report ? (
            <div className="markdown-body">
              <Markdown>{report}</Markdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Enter a topic and run the agent to see the report here.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
