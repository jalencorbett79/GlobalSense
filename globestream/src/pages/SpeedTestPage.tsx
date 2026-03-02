import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowDown, ArrowUp, Activity, RefreshCw, Gauge } from 'lucide-react';
import { useStore } from '../store/useStore';
import { runSpeedTest, SpeedTestResult } from '../utils/proxyService';
import './SpeedTestPage.css';

export default function SpeedTestPage() {
  const { isTestingSpeed, setIsTestingSpeed, connection, addToast } = useStore();
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [phase, setPhase] = useState<'idle' | 'latency' | 'download' | 'upload' | 'done'>('idle');

  const handleTest = useCallback(async () => {
    if (!connection.isConnected) {
      addToast({ type: 'warning', message: 'Connect to a proxy first to run a speed test' });
      return;
    }

    setIsTestingSpeed(true);
    setResult(null);
    setPhase('latency');

    await new Promise(r => setTimeout(r, 1000));
    setPhase('download');
    await new Promise(r => setTimeout(r, 1500));
    setPhase('upload');
    await new Promise(r => setTimeout(r, 1500));

    const res = await runSpeedTest();
    setResult(res);
    setPhase('done');
    setIsTestingSpeed(false);
    addToast({ type: 'success', message: 'Speed test complete!' });
  }, [connection.isConnected]);

  return (
    <div className="speed-test-page">
      <div className="speed-hero">
        <motion.button
          className={`speed-button ${isTestingSpeed ? 'testing' : ''} ${phase === 'done' ? 'complete' : ''}`}
          onClick={handleTest}
          whileTap={{ scale: 0.95 }}
          disabled={isTestingSpeed}
        >
          <div className="speed-rings">
            <span className="s-ring s-ring-1" />
            <span className="s-ring s-ring-2" />
          </div>
          <div className="speed-icon">
            {isTestingSpeed ? (
              <RefreshCw size={44} className="spin" />
            ) : (
              <Gauge size={44} />
            )}
          </div>
          <span className="speed-label">
            {isTestingSpeed ? phase.toUpperCase() : phase === 'done' ? 'TEST AGAIN' : 'START TEST'}
          </span>
        </motion.button>
      </div>

      {/* Phase Indicator */}
      {isTestingSpeed && (
        <div className="test-phases">
          {['latency', 'download', 'upload'].map((p) => (
            <div key={p} className={`phase-item ${phase === p ? 'active' : ''} ${
              ['latency', 'download', 'upload'].indexOf(p) < ['latency', 'download', 'upload'].indexOf(phase) ? 'completed' : ''
            }`}>
              <span className="phase-dot" />
              <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          className="speed-results"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="speed-result-card main-result">
            <ArrowDown size={24} />
            <div className="result-info">
              <span className="result-label">Download</span>
              <span className="result-value">{result.download}</span>
              <span className="result-unit">Mbps</span>
            </div>
          </div>
          <div className="speed-result-card main-result">
            <ArrowUp size={24} />
            <div className="result-info">
              <span className="result-label">Upload</span>
              <span className="result-value">{result.upload}</span>
              <span className="result-unit">Mbps</span>
            </div>
          </div>
          <div className="speed-result-card">
            <Activity size={20} />
            <div className="result-info">
              <span className="result-label">Latency</span>
              <span className="result-value">{result.latency}</span>
              <span className="result-unit">ms</span>
            </div>
          </div>
          <div className="speed-result-card">
            <Zap size={20} />
            <div className="result-info">
              <span className="result-label">Jitter</span>
              <span className="result-value">{result.jitter}</span>
              <span className="result-unit">ms</span>
            </div>
          </div>
        </motion.div>
      )}

      {!connection.isConnected && (
        <div className="speed-warning">
          <Activity size={20} />
          <span>Connect to a proxy server to test connection speed</span>
        </div>
      )}
    </div>
  );
}
