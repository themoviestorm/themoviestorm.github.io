import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { createChatThread, submitUserRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const SupportPage: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'request' | 'chat'>('request');

  // Request form state
  const [reqCategory, setReqCategory] = useState<'REQUEST' | 'ISSUE' | 'FEEDBACK' | 'SUGGESTION'>('REQUEST');
  const [reqTitle, setReqTitle] = useState('');
  const [reqBody, setReqBody] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqSuccess, setReqSuccess] = useState(false);
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Chat thread form state
  const [chatSubject, setChatSubject] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatName, setChatName] = useState('');
  const [chatEmail, setChatEmail] = useState('');
  const [chatSuccess, setChatSuccess] = useState(false);
  const [isSubmittingChat, setIsSubmittingChat] = useState(false);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReq(true);
    try {
      await submitUserRequest(
        {
          category: reqCategory,
          title: reqTitle.trim(),
          body: reqBody.trim(),
          userName: user ? user.displayName : reqName.trim(),
          userEmail: user ? user.email : reqEmail.trim()
        },
        token
      );
      setReqSuccess(true);
      setReqTitle('');
      setReqBody('');
    } catch {
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const handleSubmitChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingChat(true);
    try {
      await createChatThread(
        {
          subject: chatSubject.trim(),
          message: chatMessage.trim(),
          userName: user ? user.displayName : chatName.trim(),
          userEmail: user ? user.email : chatEmail.trim()
        },
        token
      );
      setChatSuccess(true);
      setChatSubject('');
      setChatMessage('');
    } catch {
      alert('Failed to open support thread. Please try again.');
    } finally {
      setIsSubmittingChat(false);
    }
  };

  return (
    <div className="support-page-container">
      <div className="section-header">
        <div>
          <h1 className="browse-main-title">Help & Community Support</h1>
          <p className="browse-main-sub">
            Request new movie or series torrent uploads, report audio/subtitle issues, or open a direct support ticket
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="support-tabs-row">
        <button
          onClick={() => setActiveTab('request')}
          className={`support-tab-btn ${activeTab === 'request' ? 'active' : ''}`}
        >
          <HelpCircle size={16} /> Content Request / Feedback
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`support-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
        >
          <MessageSquare size={16} /> Direct Support Chat
        </button>
      </div>

      {/* Tab 1: Request & Feedback */}
      {activeTab === 'request' && (
        <div className="support-form-card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Submit Content Request or Feedback
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Our admin team reviews submissions directly in the admin management dashboard.
          </p>

          {reqSuccess ? (
            <div className="feedback-success-box">
              <CheckCircle2 size={32} color="#10b981" />
              <h3>Submission Received!</h3>
              <p>Thank you for contributing to Movie Storm. Our moderation team will review your request.</p>
              <button onClick={() => setReqSuccess(false)} className="btn-secondary" style={{ marginTop: '1rem' }}>
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="support-form">
              <div className="form-group">
                <label>Category</label>
                <div className="filter-select-wrap">
                  <select
                    value={reqCategory}
                    onChange={e => setReqCategory(e.target.value as any)}
                    className="filter-select"
                  >
                    <option value="REQUEST">Request New Movie / Series</option>
                    <option value="ISSUE">Report Broken Torrent / Audio Issue</option>
                    <option value="FEEDBACK">General Website Feedback</option>
                    <option value="SUGGESTION">Feature Suggestion</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Title / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Please add Gladiator II in 4K UHD"
                  value={reqTitle}
                  onChange={e => setReqTitle(e.target.value)}
                  className="filter-search-input"
                />
              </div>

              <div className="form-group">
                <label>Details & Public Trackers *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide IMDb link, release year, or specific quality requests (Remux, 1080p, specific audio languages)..."
                  value={reqBody}
                  onChange={e => setReqBody(e.target.value)}
                  className="comment-textarea"
                />
              </div>

              {!user && (
                <div className="anon-user-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={reqName}
                      onChange={e => setReqName(e.target.value)}
                      className="filter-search-input"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Your Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="Your email (private)"
                      value={reqEmail}
                      onChange={e => setReqEmail(e.target.value)}
                      className="filter-search-input"
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={isSubmittingReq} className="btn-primary" style={{ marginTop: '1rem' }}>
                <Send size={16} /> {isSubmittingReq ? 'Submitting...' : 'Send Submission'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: Support Chat */}
      {activeTab === 'chat' && (
        <div className="support-form-card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Open Support Ticket
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Direct asynchronous ticket inbox. Admin replies will be accessible using your email or account.
          </p>

          {chatSuccess ? (
            <div className="feedback-success-box">
              <CheckCircle2 size={32} color="#10b981" />
              <h3>Support Thread Created!</h3>
              <p>Your ticket has been logged with the support team. You can check back for updates.</p>
              <button onClick={() => setChatSuccess(false)} className="btn-secondary" style={{ marginTop: '1rem' }}>
                Open Another Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitChat} className="support-form">
              <div className="form-group">
                <label>Ticket Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Torrent download stuck at 99%"
                  value={chatSubject}
                  onChange={e => setChatSubject(e.target.value)}
                  className="filter-search-input"
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your question or issue in detail..."
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  className="comment-textarea"
                />
              </div>

              {!user && (
                <div className="anon-user-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={chatName}
                      onChange={e => setChatName(e.target.value)}
                      className="filter-search-input"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Your Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="Your email (for reply notices)"
                      value={chatEmail}
                      onChange={e => setChatEmail(e.target.value)}
                      className="filter-search-input"
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={isSubmittingChat} className="btn-primary" style={{ marginTop: '1rem' }}>
                <Send size={16} /> {isSubmittingChat ? 'Sending...' : 'Open Support Ticket'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
