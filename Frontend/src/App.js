import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const BREATHING_PHASES = [
  { label: 'Breathe in',  duration: 4 },
  { label: 'Hold',        duration: 4 },
  { label: 'Breathe out', duration: 4 },
  { label: 'Hold',        duration: 4 },
];

function BreathingCircle() {
  const [running, setRunning]       = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown]   = useState(4);

  useEffect(() => {
    if (!running) return;

    if (countdown === 0) {
      const nextPhase = (phaseIndex + 1) % BREATHING_PHASES.length;
      setPhaseIndex(nextPhase);
      setCountdown(BREATHING_PHASES[nextPhase].duration);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [running, countdown, phaseIndex]);

  const currentPhase = BREATHING_PHASES[phaseIndex];
  const isExpanding  = phaseIndex === 0;
  const isHolding    = phaseIndex === 1 || phaseIndex === 3;

  return (
    <div className="breathe-circle-wrap">
      <div className={`breathe-ring ${
        isExpanding ? 'expand' : isHolding ? 'hold' : 'shrink'
      }`}>
        <div className="breathe-inner">
          <span className="breathe-count">{countdown}</span>
          <span className="breathe-phase">{currentPhase.label}</span>
        </div>
      </div>
      <button
        className="breathe-start"
        onClick={() => {
          setRunning(!running);
          setPhaseIndex(0);
          setCountdown(4);
        }}
      >
        {running ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am MindQuery. Ask me anything about mental health and wellness.' }
  ]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [darkMode, setDarkMode]     = useState(false);
  const [mood, setMood]             = useState(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [sessionId, setSessionId]   = useState(null);
  const [sessions, setSessions]     = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const suggestions = [
    'What is anxiety?',
    'How to manage stress?',
    'What is therapy?',
    'Signs of depression'
  ];

  const sendMessage = async (question) => {
    if (!question.trim()) return;

    const userMessage = { role: 'user', text: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://Vishnu081106-mindquery.hf.space/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question, session_id: sessionId })
      });

      const data = await response.json();
      if (data.session_id) setSessionId(data.session_id);
      const botMessage = { role: 'bot', text: data.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errMessage = { role: 'bot', text: 'Sorry, could not connect to the server. Is Flask running?' };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMood(null);
    setSessionId(null);
    setMessages([
      { role: 'bot', text: 'Hi! I am MindQuery. Ask me anything about mental health and wellness.' }
    ]);
  };

  const loadSessions = async () => {
    try {
      const res  = await fetch('https://Vishnu081106-mindquery.hf.space/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error('Could not load sessions');
    }
  };

  const loadSession = async (id) => {
    try {
      const res  = await fetch(`https://Vishnu081106-mindquery.hf.space/sessions/${id}`);
      const data = await res.json();
      setMessages(data);
      setSessionId(id);
      setMood({ label: 'returning' });
      setSidebarOpen(false);
    } catch (error) {
      console.error('Could not load session');
    }
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    try {
      await fetch(`https://Vishnu081106-mindquery.hf.space/sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Could not delete session');
    }
  };

  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
    setMessages([
      {
        role: 'bot',
        text: `I can see you're feeling ${selectedMood.label} today. I'm here for you. What's on your mind?`
      }
    ]);
  };

  if (!mood) {
    return (
      <div className={`mood-screen ${darkMode ? 'dark' : ''}`}>
        <div className="mood-card">
          <div className="mood-logo">M</div>
          <h1 className="mood-title">MindQuery</h1>
          <p className="mood-sub">Your mental wellness assistant</p>
          <div className="mood-divider" />
          <p className="mood-question">How are you feeling today?</p>
          <div className="mood-options">
            {[
              { emoji: '😔', label: 'sad',     color: '#7096c9' },
              { emoji: '😐', label: 'okay',    color: '#9b8ec9' },
              { emoji: '🙂', label: 'alright', color: '#6baa8e' },
              { emoji: '😊', label: 'good',    color: '#c9a84c' },
              { emoji: '😄', label: 'great',   color: '#c96442' },
            ].map((m) => (
              <button
                key={m.label}
                className="mood-btn"
                onClick={() => handleMoodSelect(m)}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>

      <div className="header">
        <div className="logo">M</div>
        <div className="header-text">
          <h1>MindQuery</h1>
          <p>Mental wellness assistant · powered by RAG</p>
        </div>
        <div className="header-buttons">
          <button className="history-btn" onClick={() => { setSidebarOpen(true); loadSessions(); }}>
            History
          </button>
          <button className="breathe-btn" onClick={() => setShowBreathing(true)}>
            Breathe
          </button>
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="clear-btn" onClick={clearChat}>Clear chat</button>
        </div>
      </div>

      <div className="chat">
        {messages.map((msg, index) => (
          <div key={index} className={`msg ${msg.role}`}>
            <div className={`av ${msg.role}`}>
              {msg.role === 'bot' ? 'M' : 'V'}
            </div>
            <div className="text">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg bot">
            <div className="av bot">M</div>
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="suggestions">
        {suggestions.map((s, i) => (
          <button key={i} className="chip" onClick={() => sendMessage(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="input-area">
        <textarea
          className="textarea"
          placeholder="Ask about mental wellness..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button className="send" onClick={() => sendMessage(input)}>↑</button>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className={`sidebar ${darkMode ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <p className="sidebar-title">Chat History</p>
              <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>
            <button className="new-chat-btn" onClick={clearChat}>
              + New Chat
            </button>
            <div className="session-list">
              {sessions.length === 0 ? (
                <p className="no-sessions">No past chats yet</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`session-item ${session.id === sessionId ? 'active' : ''}`}
                    onClick={() => loadSession(session.id)}
                  >
                    <div className="session-info">
                      <p className="session-title">{session.title}</p>
                      <p className="session-date">{session.created_at}</p>
                    </div>
                    <button
                      className="session-delete"
                      onClick={(e) => deleteSession(e, session.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showBreathing && (
        <div className="breathe-overlay" onClick={() => setShowBreathing(false)}>
          <div className="breathe-card" onClick={(e) => e.stopPropagation()}>
            <button className="breathe-close" onClick={() => setShowBreathing(false)}>✕</button>
            <p className="breathe-title">Box Breathing</p>
            <p className="breathe-sub">Click start and follow the circle</p>
            <BreathingCircle />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;