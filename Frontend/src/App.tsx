import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, Trash2, FileText, Loader2, BookOpen, Bot, User } from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isQuerying]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

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
      setMessages([{ role: 'bot', text: `Document "${file.name}" uploaded successfully! How can I help you explore it today?` }]);
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
      setMessages([{ role: 'bot', text: 'Text uploaded successfully! What would you like to know about it?' }]);
      setRawText('');
    } catch (err: any) {
      setError(err.message || 'Failed to upload text');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !sessionId || isQuerying) return;

    const userQuery = inputText.trim();
    setInputText('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
    
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
    setError(null);
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
        <h2>
          <BookOpen className="logo-icon" size={28} />
          NotebookLM
        </h2>
        
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
              <Loader2 className="upload-icon animate-spin" size={36} />
            ) : (
              <Upload className="upload-icon" size={36} />
            )}
            <p>{isUploading ? 'Processing Document...' : 'Upload Source Document'}</p>
            <span className="upload-subtext">Supports PDF and TXT files</span>
          </div>

          <div className="text-divider">OR</div>

          <div className="text-upload">
            <textarea 
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw text content here..."
              disabled={isUploading}
            />
            <button 
              className="btn-primary" 
              onClick={handleRawTextUpload}
              disabled={isUploading || !rawText.trim()}
            >
              {isUploading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              Process Text
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: '#ef4444', marginTop: '16px', fontSize: '0.9rem', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        <div style={{ flexGrow: 1 }}></div>

        {sessionId && (
          <>
            <div className="session-info">
              <strong>
                <span className="status-dot"></span>
                Active Session
              </strong>
              <div style={{ opacity: 0.7, fontSize: '0.75rem', fontFamily: 'monospace' }}>{sessionId}</div>
            </div>
            
            <button className="btn-danger" onClick={handleClearSession} style={{ marginTop: '12px', width: '100%' }}>
              <Trash2 size={18} style={{ marginRight: '8px' }} />
              End Session
            </button>
          </>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="chat-area">
        <header className="chat-header">
          <h3>Chat with your Document</h3>
        </header>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <BookOpen className="empty-state-icon" />
              <h3>Welcome to NotebookLM</h3>
              <p>Upload a PDF document or paste some text in the sidebar to create a grounded knowledge base, then start asking questions!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className="avatar">
                  {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isQuerying && (
            <div className="message-wrapper bot">
              <div className="avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="message-bubble" style={{ padding: '16px 20px' }}>
                  <div className="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>

        <div className="input-area">
          <div className="input-container-wrapper">
            <textarea
                ref={textareaRef}
                placeholder={sessionId ? "Ask a question about your document..." : "Upload a source document to start chatting"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={!sessionId || isQuerying}
                rows={1}
            />
            <button 
              className="btn-send"
              onClick={handleSendMessage}
              disabled={!sessionId || !inputText.trim() || isQuerying}
              title="Send message"
            >
              {isQuerying ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
