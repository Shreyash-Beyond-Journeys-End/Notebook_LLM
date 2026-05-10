import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, Trash2, FileText, Loader2 } from 'lucide-react';
import { uploadFile, uploadRawText, sendQuery, deleteSession } from './services/api';
import './App.css';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

function App() {
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('sessionId'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [rawText, setRawText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const sid = await uploadFile(file);
      setSessionId(sid);
      localStorage.setItem('sessionId', sid);
      setMessages([{ role: 'bot', text: 'Document uploaded successfully! How can I help you today?' }]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRawTextUpload = async () => {
    if (!rawText.trim()) return;

    setIsUploading(true);
    setError(null);
    try {
      const sid = await uploadRawText(rawText);
      setSessionId(sid);
      localStorage.setItem('sessionId', sid);
      setMessages([{ role: 'bot', text: 'Text uploaded successfully! How can I help you?' }]);
      setRawText('');
    } catch (err: any) {
      setError(err.message || 'Failed to upload text');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !sessionId || isQuerying) return;

    const userQuery = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setIsQuerying(true);

    try {
      const response = await sendQuery(sessionId, userQuery);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleClearSession = async () => {
    if (sessionId) {
      try {
        await deleteSession(sessionId);
      } catch (e) {
        console.error("Failed to delete session on backend", e);
      }
    }
    setSessionId(null);
    setMessages([]);
    localStorage.removeItem('sessionId');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>NotebookLM</h2>
        
        <div className="upload-section">
          <div 
            className={`upload-box ${isUploading ? 'loading' : ''}`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.txt" 
              style={{ display: 'none' }}
            />
            {isUploading ? (
              <Loader2 className="upload-icon animate-spin" />
            ) : (
              <Upload className="upload-icon" />
            )}
            <p>{isUploading ? 'Uploading...' : 'Upload PDF or TXT'}</p>
          </div>

          <div className="text-upload">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Or Paste Raw Text</p>
            <textarea 
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your content here..."
              disabled={isUploading}
            />
            <button 
              className="btn-primary" 
              onClick={handleRawTextUpload}
              disabled={isUploading || !rawText.trim()}
            >
              {isUploading ? <Loader2 className="animate-spin size-4" /> : <FileText size={18} />}
              Upload Text
            </button>
          </div>
        </div>

        {sessionId && (
          <div className="session-info">
            <strong>Active Session:</strong>
            <div style={{ opacity: 0.7, marginTop: '4px', fontSize: '0.8rem' }}>{sessionId}</div>
          </div>
        )}

        {error && <div style={{ color: '#ef4444', marginTop: '10px', fontSize: '0.9rem' }}>{error}</div>}

        {sessionId && (
          <button className="btn-danger" onClick={handleClearSession}>
            <Trash2 size={18} style={{ marginRight: '8px' }} />
            Clear Session
          </button>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="chat-area">
        <header className="chat-header">
          <h3>Assistant</h3>
        </header>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h3>Welcome to NotebookLM</h3>
              <p>Upload a document or paste some text on the left to start asking questions!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {isQuerying && (
            <div className="message-wrapper bot">
              <div className="message-bubble">
                <div className="loading-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
                placeholder={sessionId ? "Type a message" : "Upload a source to start chatting"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={!sessionId || isQuerying}
                rows={1}
            />
          </div>
          <button 
            className={`btn-send ${inputText.trim() ? 'active' : ''}`}
            onClick={handleSendMessage}
            disabled={!sessionId || !inputText.trim() || isQuerying}
          >
            <Send size={24} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
