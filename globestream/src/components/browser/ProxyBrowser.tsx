import { useState, useRef, FormEvent } from 'react';
import {
  Search, ArrowLeft, ArrowRight, RotateCw, X, Plus,
  Shield, Lock, ExternalLink, Globe, Bookmark
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getProxyBrowseUrl } from '../../utils/proxyService';
import './ProxyBrowser.css';

export default function ProxyBrowser() {
  const {
    browserUrl, setBrowserUrl, connection, selectedCountry,
    tabs, addTab, removeTab, setActiveTab, addToHistory, addToast
  } = useStore();
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = (e?: FormEvent) => {
    e?.preventDefault();

    if (!connection.isConnected) {
      addToast({ type: 'warning', message: 'Connect to a proxy first to browse securely' });
      return;
    }

    let url = inputUrl.trim();
    if (!url) return;

    // If it looks like a search query, use search engine
    if (!url.includes('.') || url.includes(' ')) {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    } else if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    setIsLoading(true);
    setBrowserUrl(url);

    // Route through the REAL proxy backend
    const proxiedUrl = getProxyBrowseUrl(url, selectedCountry?.code);
    setIframeUrl(proxiedUrl);

    // Add to browsing history
    addToHistory({
      id: `session-${Date.now()}`,
      url,
      title: url,
      timestamp: new Date(),
      country: selectedCountry!,
    });
  };

  const handleNewTab = () => {
    addTab({
      id: `tab-${Date.now()}`,
      label: 'New Tab',
      active: true,
    });
    setInputUrl('');
    setIframeUrl('');
  };

  const quickLinks = [
    { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
    { name: 'YouTube', url: 'https://www.youtube.com', icon: '📺' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📚' },
    { name: 'Naver', url: 'https://www.naver.com', icon: '🇰🇷' },
    { name: 'Twitter/X', url: 'https://x.com', icon: '🐦' },
    { name: 'News', url: 'https://news.google.com', icon: '📰' },
  ];

  return (
    <div className="proxy-browser">
      {/* Tab Bar */}
      <div className="browser-tabs">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`browser-tab ${tab.active ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Globe size={12} />
              <span className="tab-label">{tab.label}</span>
              <button
                className="tab-close"
                onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
              >
                <X size={10} />
              </button>
            </button>
          ))}
          <button className="add-tab-btn" onClick={handleNewTab}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* URL Bar */}
      <div className="browser-toolbar">
        <div className="nav-buttons">
          <button className="nav-btn" onClick={() => window.history.back()}>
            <ArrowLeft size={16} />
          </button>
          <button className="nav-btn" onClick={() => window.history.forward()}>
            <ArrowRight size={16} />
          </button>
          <button className="nav-btn" onClick={() => handleNavigate()}>
            <RotateCw size={16} className={isLoading ? 'spin' : ''} />
          </button>
        </div>

        <form className="url-bar" onSubmit={handleNavigate}>
          <div className="url-security">
            {connection.isConnected ? (
              <Lock size={14} className="secure" />
            ) : (
              <Shield size={14} className="insecure" />
            )}
          </div>
          <input
            type="text"
            className="url-input"
            placeholder={connection.isConnected
              ? `Search or enter URL — routing via ${selectedCountry?.flag} ${selectedCountry?.name}`
              : 'Connect to a proxy to start browsing...'
            }
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          {inputUrl && (
            <button type="button" className="url-clear" onClick={() => setInputUrl('')}>
              <X size={14} />
            </button>
          )}
          <button type="submit" className="url-go">
            <Search size={14} />
          </button>
        </form>

        <div className="toolbar-actions">
          <button className="nav-btn" title="Bookmark">
            <Bookmark size={16} />
          </button>
          <button className="nav-btn" title="Open externally">
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Security Banner */}
      {connection.isConnected && (
        <div className="security-banner">
          <Shield size={14} />
          <span>
            Proxy active — Traffic routed through{' '}
            <strong>{selectedCountry?.flag} {selectedCountry?.name}</strong> • {connection.latency}ms
          </span>
        </div>
      )}

      {/* Content Area */}
      <div className="browser-content">
        {iframeUrl ? (
          <div className="iframe-container">
            {isLoading && (
              <div className="iframe-loading">
                <div className="loading-bar" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              title="Proxy Browser"
              className="browser-iframe"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        ) : (
          /* New Tab Page */
          <div className="new-tab-page">
            <div className="ntp-hero">
              <Globe size={56} className="ntp-globe" />
              <h2 className="gradient-text">Browse the World</h2>
              <p>Search or enter a URL — pages load through your selected country's proxy</p>
            </div>

            <div className="quick-links">
              {quickLinks.map((link) => (
                <button
                  key={link.name}
                  className="quick-link"
                  onClick={() => {
                    if (!connection.isConnected) {
                      addToast({ type: 'warning', message: 'Connect to a proxy first' });
                      return;
                    }
                    setInputUrl(link.url);
                    setBrowserUrl(link.url);
                    const proxiedUrl = getProxyBrowseUrl(link.url, selectedCountry?.code);
                    setIframeUrl(proxiedUrl);
                    setIsLoading(true);
                  }}
                >
                  <span className="ql-icon">{link.icon}</span>
                  <span className="ql-name">{link.name}</span>
                </button>
              ))}
            </div>

            {!connection.isConnected && (
              <div className="ntp-warning">
                <Shield size={18} />
                <span>Connect to a proxy server to start browsing through another region</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
