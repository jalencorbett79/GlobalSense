import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Server, Lock, ExternalLink, Copy, Check,
  Globe, Zap, ChevronDown, ChevronUp, Terminal
} from 'lucide-react';
import { useStore } from '../store/useStore';
import './VpnPage.css';

interface Tool {
  name: string;
  description: string;
  url: string;
  category: string;
  features: string[];
  license: string;
}

const vpnTools: Tool[] = [
  {
    name: 'WireGuard',
    description: 'Fast, modern, and secure VPN tunnel. Aims to be faster, simpler, and leaner than IPsec/OpenVPN.',
    url: 'https://www.wireguard.com/',
    category: 'VPN Protocol',
    features: ['Modern cryptography', 'Simple to configure', 'Very fast', 'Cross-platform', 'Kernel-level performance'],
    license: 'GPLv2',
  },
  {
    name: 'OpenVPN',
    description: 'Full-featured open source SSL VPN solution. Battle-tested and widely supported.',
    url: 'https://openvpn.net/',
    category: 'VPN Protocol',
    features: ['SSL/TLS based', 'Wide platform support', 'TCP & UDP modes', 'Certificate-based auth', 'Community driven'],
    license: 'GPLv2',
  },
  {
    name: 'Netbird',
    description: 'Open-source VPN management platform built on WireGuard. Create secure private networks easily.',
    url: 'https://netbird.io/',
    category: 'VPN Management',
    features: ['WireGuard-based', 'Zero-config networking', 'SSO integration', 'Peer-to-peer', 'Self-hostable'],
    license: 'Apache 2.0',
  },
  {
    name: 'Headscale',
    description: 'Open-source, self-hosted implementation of the Tailscale control server.',
    url: 'https://headscale.net/',
    category: 'VPN Management',
    features: ['Tailscale compatible', 'Self-hosted control plane', 'WireGuard-based', 'ACL support', 'Multi-user'],
    license: 'BSD-3-Clause',
  },
  {
    name: 'Outline',
    description: 'Shadowsocks-based open-source proxy tool by Jigsaw (Google). Easy to deploy and use.',
    url: 'https://getoutline.org/',
    category: 'Proxy',
    features: ['Shadowsocks protocol', 'Easy deployment', 'Mobile apps', 'Traffic obfuscation', 'Server manager app'],
    license: 'Apache 2.0',
  },
  {
    name: 'Algo VPN',
    description: 'Set up a personal VPN in the cloud in 5 minutes with Ansible. Supports WireGuard and IKEv2.',
    url: 'https://github.com/trailofbits/algo',
    category: 'VPN Setup',
    features: ['WireGuard + IKEv2', 'Automated setup', 'Cloud provider support', 'Blocks ads', 'Hardened configs'],
    license: 'AGPL-3.0',
  },
  {
    name: 'Pritunl',
    description: 'Open-source enterprise distributed OpenVPN and WireGuard server.',
    url: 'https://pritunl.com/',
    category: 'VPN Server',
    features: ['Multi-cloud', 'Web dashboard', 'OpenVPN + WireGuard', 'Zero-trust support', 'Auto certificates'],
    license: 'AGPL-3.0',
  },
  {
    name: 'SoftEther VPN',
    description: 'Free, open-source, cross-platform, multi-protocol VPN software product.',
    url: 'https://www.softether.org/',
    category: 'VPN Server',
    features: ['Multi-protocol', 'SSL-VPN', 'L2TP/IPsec', 'OpenVPN', 'Cross-platform'],
    license: 'Apache 2.0',
  },
];

const proxyTools: Tool[] = [
  {
    name: 'Squid',
    description: 'Full-featured web proxy cache server. Supports HTTP, HTTPS, FTP, and more.',
    url: 'http://www.squid-cache.org/',
    category: 'Proxy Server',
    features: ['HTTP caching', 'SSL/TLS', 'Access control', 'Content filtering', 'Traffic analysis'],
    license: 'GPLv2',
  },
  {
    name: 'Shadowsocks',
    description: 'A secure socks5 proxy designed to protect your Internet traffic. Used for censorship bypass.',
    url: 'https://shadowsocks.org/',
    category: 'Proxy Protocol',
    features: ['SOCKS5 proxy', 'Encrypted traffic', 'Fast', 'Multi-platform', 'Obfuscation support'],
    license: 'Apache 2.0',
  },
  {
    name: 'Nginx',
    description: 'High-performance reverse proxy, load balancer, and web server.',
    url: 'https://nginx.org/',
    category: 'Reverse Proxy',
    features: ['HTTP/HTTPS reverse proxy', 'Load balancing', 'Caching', 'SSL termination', 'High performance'],
    license: 'BSD-2-Clause',
  },
  {
    name: 'Traefik',
    description: 'Modern HTTP reverse proxy and load balancer designed for microservices.',
    url: 'https://traefik.io/',
    category: 'Reverse Proxy',
    features: ['Auto TLS via Let\'s Encrypt', 'Docker native', 'Dynamic config', 'Middleware', 'Dashboard'],
    license: 'MIT',
  },
];

function ToolCard({ tool, onCopyError }: { tool: Tool; onCopyError: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      onCopyError();
    });
  };

  return (
    <motion.div
      className="vpn-tool-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="tool-header" onClick={() => setExpanded(!expanded)}>
        <div className="tool-title-group">
          <div className="tool-icon">
            <Shield size={18} />
          </div>
          <div>
            <h4 className="tool-name">{tool.name}</h4>
            <span className="tool-category">{tool.category}</span>
          </div>
        </div>
        <div className="tool-header-right">
          <span className="tool-license">{tool.license}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      <p className="tool-description">{tool.description}</p>

      {expanded && (
        <motion.div
          className="tool-expanded"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <div className="tool-features">
            {tool.features.map((f) => (
              <span key={f} className="tool-feature">
                <Check size={11} /> {f}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="tool-actions">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="tool-link"
        >
          <ExternalLink size={13} /> Visit Project
        </a>
        <button
          className="tool-copy-btn"
          onClick={() => handleCopy(tool.url)}
          title="Copy URL"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
    </motion.div>
  );
}

export default function VpnPage() {
  const { addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'vpn' | 'proxy' | 'guide'>('vpn');

  return (
    <div className="vpn-page">
      {/* Header */}
      <div className="vpn-hero">
        <div className="vpn-hero-icon">
          <Shield size={32} />
        </div>
        <div>
          <h2>VPN & Proxy Tools</h2>
          <p>
            Open-source self-hosted privacy tools from the{' '}
            <a href="https://github.com/awesome-selfhosted/awesome-selfhosted" target="_blank" rel="noopener noreferrer">
              awesome-selfhosted
            </a>{' '}
            collection. All free, all open source.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="vpn-tabs">
        <button
          className={`vpn-tab ${activeTab === 'vpn' ? 'active' : ''}`}
          onClick={() => setActiveTab('vpn')}
        >
          <Lock size={15} /> VPN Tools
        </button>
        <button
          className={`vpn-tab ${activeTab === 'proxy' ? 'active' : ''}`}
          onClick={() => setActiveTab('proxy')}
        >
          <Globe size={15} /> Proxy Tools
        </button>
        <button
          className={`vpn-tab ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          <Terminal size={15} /> Quick Start Guide
        </button>
      </div>

      {/* VPN Tools */}
      {activeTab === 'vpn' && (
        <div className="vpn-tools-grid">
          {vpnTools.map((tool) => (
            <ToolCard
              key={tool.name}
              tool={tool}
              onCopyError={() => addToast({ type: 'error', message: 'Failed to copy — clipboard access denied' })}
            />
          ))}
        </div>
      )}

      {/* Proxy Tools */}
      {activeTab === 'proxy' && (
        <div className="vpn-tools-grid">
          {proxyTools.map((tool) => (
            <ToolCard
              key={tool.name}
              tool={tool}
              onCopyError={() => addToast({ type: 'error', message: 'Failed to copy — clipboard access denied' })}
            />
          ))}
        </div>
      )}

      {/* Quick Start Guide */}
      {activeTab === 'guide' && (
        <div className="vpn-guide">
          <div className="guide-section">
            <div className="guide-section-header">
              <Zap size={18} className="guide-icon" />
              <h3>WireGuard Quick Setup</h3>
            </div>
            <p>The fastest way to get a personal VPN up and running:</p>
            <div className="code-block">
              <div className="code-title">1. Install WireGuard server (Ubuntu/Debian)</div>
              <pre>{`# Install WireGuard
sudo apt install wireguard

# Generate key pairs
wg genkey | tee server-private.key | wg pubkey > server-public.key
wg genkey | tee client-private.key | wg pubkey > client-public.key`}</pre>
            </div>
            <div className="code-block">
              <div className="code-title">2. Server config (/etc/wireguard/wg0.conf)</div>
              <pre>{`[Interface]
PrivateKey = <SERVER_PRIVATE_KEY>
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <CLIENT_PUBLIC_KEY>
AllowedIPs = 10.0.0.2/32`}</pre>
            </div>
            <div className="code-block">
              <div className="code-title">3. Client config (wg0-client.conf)</div>
              <pre>{`[Interface]
PrivateKey = <CLIENT_PRIVATE_KEY>
Address = 10.0.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = <SERVER_PUBLIC_KEY>
Endpoint = <YOUR_SERVER_IP>:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`}</pre>
            </div>
            <div className="code-block">
              <div className="code-title">4. Start the VPN</div>
              <pre>{`# Enable IP forwarding
echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf
sysctl -p

# Start WireGuard
wg-quick up wg0
systemctl enable wg-quick@wg0`}</pre>
            </div>
          </div>

          <div className="guide-section">
            <div className="guide-section-header">
              <Server size={18} className="guide-icon" />
              <h3>Algo VPN (Automated)</h3>
            </div>
            <p>Deploy a personal VPN server in 5 minutes with Algo:</p>
            <div className="code-block">
              <pre>{`# Clone Algo
git clone https://github.com/trailofbits/algo

# Install dependencies
cd algo && pip3 install -r requirements.txt

# Configure users in config.cfg
# Then deploy (supports DigitalOcean, AWS, GCP, Azure, Vultr)
./algo`}</pre>
            </div>
          </div>

          <div className="guide-section">
            <div className="guide-section-header">
              <Globe size={18} className="guide-icon" />
              <h3>Shadowsocks Proxy</h3>
            </div>
            <p>Quick proxy server for censorship bypass:</p>
            <div className="code-block">
              <pre>{`# Install via pip
pip install shadowsocks

# Server config (config.json)
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "password": "your-password",
  "timeout": 300,
  "method": "aes-256-gcm"
}

# Start server
ssserver -c config.json -d start`}</pre>
            </div>
          </div>

          <div className="info-banner">
            <Shield size={16} />
            <div>
              <strong>GlobeStream uses HTTP proxies</strong> — the server-side proxy gateway
              routes your Browse traffic through regional servers. For full VPN coverage of
              your entire device, deploy one of the tools above on your own server.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
