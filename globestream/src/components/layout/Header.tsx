import { Sun, Moon, Bell, User } from 'lucide-react';
import { useStore } from '../../store/useStore';
import './Header.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { theme, toggleTheme, selectedCountry, connection } = useStore();

  return (
    <header className="app-header glass">
      <div className="header-left">
        <div className="header-title-group">
          <h1 className="header-title">{title}</h1>
          {subtitle && <span className="header-subtitle">{subtitle}</span>}
        </div>
      </div>

      <div className="header-right">
        {/* Current Region Badge */}
        {selectedCountry && (
          <div className={`region-badge ${connection.isConnected ? 'active' : ''}`}>
            <span className="region-flag">{selectedCountry.flag}</span>
            <span className="region-name">{selectedCountry.name}</span>
            {connection.isConnected && (
              <span className="region-ping">{connection.latency}ms</span>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button className="header-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="header-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        {/* Profile */}
        <button className="header-btn header-avatar" title="Profile">
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
