import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings, Moon, Sun, Subtitles, Shield, Type, Info, Activity } from 'lucide-react';
import { getProxyHealth, isBackendConfigured } from '../utils/proxyService';

export default function SettingsPage() {
  const {
    theme, toggleTheme,
    subtitlesEnabled, setSubtitlesEnabled,
    subtitleFontSize, setSubtitleFontSize,
  } = useStore();

  const [healthData, setHealthData] = useState<{ total: number; alive: number; dead: number } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const handleCheckHealth = async () => {
    setCheckingHealth(true);
    try {
      const data = await getProxyHealth();
      setHealthData(data);
    } catch {
      setHealthData(null);
    }
    setCheckingHealth(false);
  };
  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>
        <Settings size={22} style={{ display: 'inline', marginRight: 10 }} />
        Settings
      </h2>

      {/* Appearance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gs-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Appearance
        </h3>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px',
          background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-light)', borderRadius: 'var(--gs-radius)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Theme</div>
              <div style={{ fontSize: 12, color: 'var(--gs-text-tertiary)' }}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</div>
            </div>
          </div>
          <button onClick={toggleTheme} style={{
              padding: '6px 14px', background: 'var(--gs-bg-tertiary)', border: '1px solid var(--gs-border)',
              borderRadius: 'var(--gs-radius-sm)', color: 'var(--gs-text-primary)', cursor: 'pointer', fontSize: 13, fontWeight: 500
          }}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Subtitles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gs-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <Subtitles size={14} style={{ display: 'inline', marginRight: 6 }} /> Subtitles
        </h3>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px',
          background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-light)', borderRadius: 'var(--gs-radius)'
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>English Subtitles</div>
            <div style={{ fontSize: 12, color: 'var(--gs-text-tertiary)' }}>Show on all videos by default</div>
          </div>
          <button onClick={() => setSubtitlesEnabled(!subtitlesEnabled)} style={{
              width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: subtitlesEnabled ? 'var(--gs-accent)' : 'var(--gs-bg-active)', position: 'relative', transition: 'background 0.2s'
          }}>
            <span style={{
              position: 'absolute', top: 3, left: subtitlesEnabled ? 21 : 3, width: 18, height: 18,
              background: 'white', borderRadius: '50%', transition: 'left 0.2s'
            }} />
          </button>
        </div>
        <div style={{
          padding: '14px 16px', background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-light)',
          borderRadius: 'var(--gs-radius)', display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}>
            <Type size={16} /> Subtitle Font Size
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['small', 'medium', 'large'] as const).map(size => (
              <button key={size} onClick={() => setSubtitleFontSize(size)} style={{
                  flex: 1, padding: '8px 0', textAlign: 'center',
                  background: subtitleFontSize === size ? 'var(--gs-accent-glow)' : 'var(--gs-bg-tertiary)',
                  border: `1px solid ${subtitleFontSize === size ? 'var(--gs-accent)' : 'var(--gs-border)'}`,
                  borderRadius: 'var(--gs-radius-sm)',
                  color: subtitleFontSize === size ? 'var(--gs-accent-light)' : 'var(--gs-text-secondary)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s ease'
              }}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
          </div>
      </div>

      {/* Proxy Health */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gs-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <Shield size={14} style={{ display: 'inline', marginRight: 6 }} /> Proxy Backend
        </h3>
        <div style={{
          padding: '14px 16px', background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-light)',
          borderRadius: 'var(--gs-radius)', display: 'flex', flexDirection: 'column', gap: 10
        }}>
          {isBackendConfigured() ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Server Health</div>
                <button onClick={handleCheckHealth} disabled={checkingHealth} style={{
                  padding: '6px 14px', background: 'var(--gs-bg-tertiary)', border: '1px solid var(--gs-border)',
                  borderRadius: 'var(--gs-radius-sm)', color: 'var(--gs-text-primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600
                }}>
                  <Activity size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {checkingHealth ? 'Checking...' : 'Check Now'}
                </button>
              </div>
              {healthData && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, padding: 10, background: 'var(--gs-success-bg)', borderRadius: 'var(--gs-radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gs-success)' }}>{healthData.alive}</div>
                    <div style={{ fontSize: 11, color: 'var(--gs-text-tertiary)' }}>Alive</div>
                  </div>
                  <div style={{ flex: 1, padding: 10, background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--gs-radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{healthData.dead}</div>
                    <div style={{ fontSize: 11, color: 'var(--gs-text-tertiary)' }}>Dead</div>
                  </div>
                  <div style={{ flex: 1, padding: 10, background: 'var(--gs-bg-tertiary)', borderRadius: 'var(--gs-radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gs-text-primary)' }}>{healthData.total}</div>
                    <div style={{ fontSize: 11, color: 'var(--gs-text-tertiary)' }}>Total</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--gs-text-tertiary)', lineHeight: 1.5 }}>
              Backend not configured. Set <code>VITE_PROXY_API_URL</code> to your GlobeStream
              server URL to enable regional proxy routing and health checks.
              <br />
              <span style={{ fontSize: 12, opacity: 0.7 }}>Speed tests use Cloudflare CDN when no backend is present.</span>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div style={{
        padding: '14px 16px', background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-light)',
        borderRadius: 'var(--gs-radius)', display: 'flex', alignItems: 'center', gap: 10
      }}>
        <Info size={18} style={{ color: 'var(--gs-text-tertiary)' }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>GlobeStream v2.0.0</div>
          <div style={{ fontSize: 12, color: 'var(--gs-text-tertiary)' }}>
            {isBackendConfigured() ? 'Real proxy routing via GlobeStream Gateway' : 'Frontend-only mode — speed tests via Cloudflare CDN'}
          </div>
        </div>
      </div>
    </div>
  );
}

