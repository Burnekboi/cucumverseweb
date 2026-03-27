import React, { useState, useEffect, useMemo, useRef } from 'react';
import botLogo from './assets/bot-logo.png';
import { Connection, PublicKey } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Send,
  Rocket,
  Wallet,
  Upload,
  Sparkles,
  Settings,
  X,
  Activity,
  TrendingUp,
  Lock,
  Copy,
  RefreshCw,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import './App.css';

// --- Constants ---
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const rpcList = (import.meta.env.VITE_RPC_URL || "").split(',').map(url => url.trim());

function getSmartConnection() {
  // Fallback to public if .env is missing
  if (!rpcList.length || rpcList[0] === "") {
    return new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  }
  const randomRpc = rpcList[Math.floor(Math.random() * rpcList.length)];
  return new Connection(randomRpc, 'confirmed');
}

// Global helper to safely fetch SOL balance
async function getSolanaBalance(connection, address) {
  try {
    if (!address || address.length < 32 || address === "Generating...") return 0;
    const pk = new PublicKey(address);
    const lamports = await connection.getBalance(pk);
    return lamports / 1e9;
  } catch (err) {
    return 0;
  }
}

// --- Sub-Components ---

const AnimatedStar = React.memo(({ left, top, size, duration }) => (
  <motion.div
    className="absolute rounded-full bg-green-400"
    style={{ left, top, width: size, height: size }}
    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
    transition={{ duration: duration / 1000, repeat: Infinity, ease: 'easeInOut' }}
  />
));

const StarField = () => {
  const stars = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 2000 + 1000,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => <AnimatedStar key={star.id} {...star} />)}
    </div>
  );
};

const MainWalletCard = ({ address = "", balance = 0 }) => {
  // 1. Safety check for slicing (Prevents the Blank Page crash if address is null/empty)
  const displayAddress = address && address !== "No Wallet Found"
    ? `${address.slice(0, 6)}...${address.slice(-6)}` 
    : "Connecting...";

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-5 mb-8 relative overflow-hidden group shadow-2xl shadow-emerald-900/10 transition-all duration-300">
      
      {/* Animated Background Glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-500" />

      <div className="flex flex-col gap-5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Master Icon Box */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Wallet size={20} className="text-white" />
            </div>
            
            <div className="text-left">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Master Controller</p>
              <p className="text-xs font-mono text-zinc-400">
                {displayAddress}
              </p>
            </div>
          </div>

          {/* Balance Display - Pulls from URL balance param or Live Sync */}
          <div className="text-right">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Available Balance</p>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-2xl font-black text-white tracking-tighter italic">
                {Number(balance || 0).toFixed(3)}
              </span>
              <span className="text-xs font-bold text-emerald-500 italic uppercase ml-1">SOL</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              if (address && address !== "No Wallet Found") {
                navigator.clipboard.writeText(address);
              }
            }}
            className="flex items-center justify-center gap-2 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-all group/btn"
          >
            <Copy size={14} className="text-zinc-500 group-hover/btn:text-emerald-400 transition-colors" />
            <span className="text-[10px] font-black uppercase text-zinc-400 group-hover/btn:text-zinc-200">Copy Address</span>
          </button>
          
          <button 
            className="flex items-center justify-center gap-2 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-all group/btn"
          >
            <RefreshCw size={14} className="text-zinc-500 group-hover/btn:text-emerald-400 transition-colors" />
            <span className="text-[10px] font-black uppercase text-zinc-400 group-hover/btn:text-zinc-200">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const WalletCard = ({ wallet, isSelected, onSelect }) => {
  const activeStyles = isSelected 
    ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02] border-emerald-500/60 bg-emerald-500/10' 
    : 'border-white/5 hover:border-white/20 opacity-80 hover:opacity-100 bg-zinc-900/40';

  const shortAddress = wallet?.address 
    ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}` 
    : "0x00...000";

  const displayBalance = typeof wallet?.balance === 'number' 
    ? wallet.balance.toFixed(3) 
    : "0.000";

  return (
    <button
      onClick={() => onSelect(wallet.id)}
      className={`w-full p-4 rounded-2xl border-2 flex flex-row items-center justify-between transition-all duration-300 backdrop-blur-md mb-3 ${activeStyles}`}
    >
      <div className="flex flex-row items-center gap-4 text-left">
        {/* Wallet Icon Box */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${
          isSelected ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-zinc-800/50'
        }`}>
          <Wallet size={20} className={isSelected ? 'text-white' : 'text-zinc-500'} />
        </div>
        
        <div>
          {/* Wallet Name / ID */}
          <div className={`font-black text-xs uppercase tracking-widest leading-none mb-1 ${
            isSelected ? 'text-emerald-400' : 'text-white'
          }`}>
            {wallet.name || `Bot Wallet #${wallet.id + 1}`}
          </div>
          {/* Mono Address */}
          <div className="text-[10px] font-mono text-zinc-500 tracking-tighter">
            {shortAddress}
          </div>
        </div>
      </div>

      {/* Balance Display Section */}
      <div className="text-right">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Balance</p>
        <div className="text-sm font-black text-white italic">
          {displayBalance} <span className="text-emerald-500 text-[10px] not-italic ml-0.5">SOL</span>
        </div>
      </div>
    </button>
  );
};

const TradeConfigModal = ({ visible, onClose, config, setConfig, onSave }) => {
  if (!visible) return null;
  const fields = [
    { label: 'Slippage (%)', key: 'slippage', step: '0.1' },
    { label: 'Min Buy (SOL)', key: 'minBuy', step: '0.01' },
    { label: 'Max Buy (SOL)', key: 'maxBuy', step: '0.01' },
    { label: 'Take Profit (%)', key: 'takeProfit', step: '1' },
    { label: 'Sell Percent (%)', key: 'sellPercent', step: '1' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-800 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Trade Configuration</h2>
          <button onClick={onClose} className="p-2"><X size={24} color="#a1a1aa" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">{f.label}</label>
              <input
                type="number" step={f.step}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none"
                value={config[f.key]}
                onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <button onClick={onSave} className="w-full bg-green-600 py-4 rounded-xl text-white font-bold">Save Settings</button>
      </motion.div>
    </div>
  );
};

  // INDIVIDUAL WALLET COMPONENT
const WalletItem = ({ wallet, isSelected, onSelect }) => {
  const activeShadow = isSelected ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700';
  
  return (
    <button
      onClick={() => onSelect(wallet.id)}
      className={`w-full p-4 rounded-xl border-2 flex flex-row items-center justify-between transition-all duration-300 mb-2 ${activeShadow}`}
    >
      <div className="flex flex-row items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isSelected ? 'bg-emerald-500' : 'bg-zinc-800/50'}`}>
          <Wallet size={22} color={isSelected ? 'white' : '#71717a'} />
        </div>
        <div className="text-left">
          <div className={`font-bold text-sm ${isSelected ? 'text-emerald-400' : 'text-white'}`}>{wallet.name}</div>
          <div className="text-[10px] font-mono text-zinc-500">{wallet.address}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-black text-white">{wallet.balance} <span className="text-emerald-500 text-[10px]">SOL</span></div>
      </div>
    </button>
  );
};

// LIVE TERMINAL LOGS COMPONENT
const LogScreen = ({ logs, onStop, onSellAll, onClear }) => {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="flex flex-col w-full gap-3 animate-in fade-in duration-500">
      <div className="flex gap-2">
        <button onClick={onStop} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg text-xs uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
          <span>✋</span> Stop
        </button>
        <button onClick={onSellAll} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-xs uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
          <span>💥</span> Dump
        </button>
        <button onClick={onClear} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg text-xs uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
          <span>🧹</span> Clear
        </button>
      </div>

      <div ref={scrollRef} className="bg-black text-green-400 p-4 font-mono text-xs h-80 overflow-y-auto rounded-lg border border-gray-700 shadow-2xl border-t-4 border-t-red-500">
        <div className="sticky top-0 bg-black pb-2 mb-2 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-white font-bold tracking-widest">⚡ CUCUMVERSE TERMINAL</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 uppercase">Live Feed</span>
            <span className="animate-pulse h-2 w-2 rounded-full bg-green-500"></span>
          </div>
        </div>
        {logs.length === 0 && <div className="text-gray-600 italic animate-pulse">Waiting for blockchain activity...</div>}
        {logs.map((log, index) => (
          <div key={index} className="mb-3 border-l border-gray-800 pl-2 animate-in slide-in-from-left-2 duration-300">
            {log.status === 'success' ? (
              <div className={log.isSell ? "text-yellow-500" : "text-green-500"}>
                {log.message ? (
                  <span className="font-bold">{log.message}</span>
                ) : (
                  <>
                    <span className="font-bold">[{log.isSell ? '💰' : '✓'}] Wallet #{log.walletNum}</span>
                    <div className="text-gray-400 pl-4">{log.isSell ? '📉 Sold' : '📈 Bought'} {log.tokenAmount} tokens</div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-red-500 italic">[!] {log.message}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tg, setTg] = useState(null);
  
  const detectedChatId = useMemo(() => window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 1897768020, []);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeTab, setActiveTab] = useState('tokens');
  const [walletView, setWalletView] = useState('list'); 
  const [isTrading, setIsTrading] = useState(false);
  const [logs, setLogs] = useState([]);

  // Form State
  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [tokenImage, setTokenImage] = useState(null);
  const [autoBuy, setAutoBuy] = useState(false);
  const [initialBuyAmount, setInitialBuyAmount] = useState('0.1');

  // Socials
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');

  // Wallets & Selection
  const [wallets, setWallets] = useState([]);
  const [selectedWalletIds, setSelectedWalletIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [balance, setBalance] = useState(0);

  // Configuration
  const [tradeConfig, setTradeConfig] = useState({ slippage: '5', minBuy: '0.01', maxBuy: '0.05', takeProfit: '20', sellPercent: '20' });
  const [showTradeConfig, setShowTradeConfig] = useState(false);

  // UI Flow
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  
useEffect(() => {
  const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
  window.addEventListener('mousemove', handleMouseMove);

  const params = new URLSearchParams(window.location.search);
  const urlAddr = params.get('wallet'), urlBal = params.get('balance'), urlBots = params.get('bots');

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    setTg(window.Telegram.WebApp);
  }

  if (urlAddr) setWalletAddress(urlAddr);
  if (urlBal) {
    const p = parseFloat(urlBal.replace(/[^0-9.]/g, ''));
    if (!isNaN(p)) setBalance(p);
  }
  if (urlBots) try { setWallets(JSON.parse(atob(urlBots))); } catch (e) { console.error("Bot Handshake fail"); }

  // Load trade config from bot session
  const loadTradeConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trade-config/${window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 1897768020}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          setTradeConfig({
            slippage: String(data.config.slippage),
            minBuy: String(data.config.minBuy),
            maxBuy: String(data.config.maxBuy),
            takeProfit: String(data.config.takeProfit),
            sellPercent: String(data.config.sellPercent),
          });
        }
      }
    } catch (e) {
      console.error("Trade config load error:", e);
    }
  };
  loadTradeConfig();

  const syncDashboard = async () => {
  // If we don't even have the main address yet, don't bother the RPC
  const addr = new URLSearchParams(window.location.search).get('wallet') || urlAddr;
  if (!addr) return;

  try {
    // Attempt internal API fetch first for guaranteed syncing
    let mB = 0;
    try {
      const res = await fetch(`${API_BASE_URL}/api/balance/${addr}`);
      if (res.ok) {
        const data = await res.json();
        mB = data.balance || 0;
      } else {
        throw new Error("Internal API unavailable");
      }
    } catch (e) {
      // Fallback to Smart RPC Connection directly
      const conn = getSmartConnection();
      mB = await getSolanaBalance(conn, addr);
    }

    setBalance(p => (mB === 0 && p > 0) ? p : mB);

    // Only sync if we actually have wallets in state
    setWallets(async (prev) => {
      if (!prev || prev.length === 0) return prev; // Don't sync an empty fleet
      
      const conn = getSmartConnection();
      const updated = await Promise.all(prev.map(async (w) => {
        let b = 0;
        try {
           const resBot = await fetch(`${API_BASE_URL}/api/balance/${w.address}`);
           if (resBot.ok) {
              const d = await resBot.json();
              b = d.balance || 0;
           } else throw new Error();
        } catch(e) {
           b = await getSolanaBalance(conn, w.address);
        }
        return { ...w, balance: (b === 0 && w.balance > 0) ? w.balance : b };
      }));
      
      setWallets(updated);
      return updated;
    });
  } catch (err) {
    console.error("Sync error:", err);
  }
};

  syncDashboard();
  const interval = setInterval(syncDashboard, 30000);
  return () => { window.removeEventListener('mousemove', handleMouseMove); clearInterval(interval); };
}, []);

// STATUS POLLING LOOP
useEffect(() => {
  if (!isTrading && !isDeploying) return;
  const poll = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/status/${detectedChatId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.logs && data.logs.length > 0) {
            setLogs(data.logs);
          }
          if (data.mintAddress) {
            setDeployResult(prev => {
              // If we are just receiving the mint address for the first time
              if (prev && prev.tokenAddress !== data.mintAddress) {
                // Wipe form so user can make a new one!
                setTokenName('');
                setSymbol('');
                setDescription('');
                setTokenImage(null);
                return { ...prev, tokenAddress: data.mintAddress };
              }
              return prev;
            });
            setIsDeploying(false); // <--- Add this! Unlocks the Launch Button
          }
          if (data.isTrading !== undefined && isTrading) {
             if (data.isTrading === false) setIsTrading(false);
          }
        }
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
  }, 2000);
  return () => clearInterval(poll);
}, [isTrading, isDeploying, detectedChatId]);

  const handleStop = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: detectedChatId, action: 'STOP_TRADE' })
      });
      setIsTrading(false);
      setLogs(prev => [...prev, { status: 'failed', message: '🛑 Trade Stopped. You can now deploy a new token.' }]);
    } catch (e) {
      console.error("Stop error:", e);
    }
  };

  const handleSellAll = async () => {
    if(window.confirm("ARE YOU SURE? This will dump all bot tokens immediately.")) {
      try {
        await fetch(`${API_BASE_URL}/api/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: detectedChatId, action: 'SELL_ALL' })
        });
        setIsTrading(false);
        setIsDeploying(false); // Unlock launch button
        setDeployResult(null);
        setLogs(prev => [...prev, { status: 'success', isSell: true, message: '💥 Dump initialized. Ready for new token.' }]);
      } catch (e) {
        console.error("Sell error:", e);
      }
    }
  };

  const toggleWallet = (id) => {
    const newSet = new Set(selectedWalletIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedWalletIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedWalletIds(new Set());
    } else {
      setSelectedWalletIds(new Set(wallets.map(w => w.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleDeployClick = () => {
    if (!tokenName || !symbol) return alert("Please fill in Token Name and Symbol");
    setShowDeployConfirm(true);
  };

  const handleConfirmDeploy = async () => {
  // 1. Basic Validation
  if (!tokenName || !symbol) {
    alert("Please enter a Token Name and Symbol.");
    return;
  }

  // 2. UI state updates - Keeping the user informed while the "Kitchen" works
  setShowDeployConfirm(false);
  setIsDeploying(true);    
  setIsTrading(true);     
  setActiveTab('wallets'); 
  setWalletView('logs');   
  
  setLogs([
    { status: 'processing', message: '📡 Connecting to Cucumverse Engine...' },
    { status: 'processing', message: `📦 Packaging Metadata for ${symbol}...` }
  ]);
  
  const botFooter = `\n\n🚀 Created via Cucumverse Bot\n🔗 t.me/cucumverse_bot`;
  
  // 3. INTELLIGENT USER DETECTION (Now using memoized global) 

  const payload = {
    chatId: detectedChatId, 
    action: "DEPLOY_TOKEN",
    data: {
      name: tokenName.trim(),
      symbol: symbol.trim().toUpperCase(),
      description: (description || "") + botFooter,
      main_wallet: walletAddress,
      auto_buy: autoBuy,
      initial_buy_sol: parseFloat(initialBuyAmount) || 0, 
      image_data: tokenImage, 
      links: {
        twitter: twitter || "",
        telegram: telegram || "",
        website: website || ""
      },
      bot_fleet: Array.from(selectedWalletIds),
      config: tradeConfig
    }
  };

  try {
    // 4. THE HANDSHAKE
    // Using the relative path '/api/deploy' requires 'vite.config.js' proxy to be active!
    const response = await fetch(`${API_BASE_URL}/api/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // 5. HANDLING THE RESPONSE
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Server reached but failed to start deployment");
    }

    const result = await response.json();

    if (result.success) {
      setLogs(prev => [
        ...prev, 
        { status: 'success', message: '🚀 Deployment initiated! Watch your Telegram chat for updates.' }
      ]);
      // Cache the token info BEFORE wiping it in the poll
      setDeployResult({ 
        tokenAddress: "Awaiting Mint...",
        tokenName: tokenName.trim(),
        symbol: symbol.trim().toUpperCase()
      });
    } else {
      throw new Error(result.error || "Deployment logic failed on server.");
    }

  } catch (err) {
    console.error("API Error:", err);
    setLogs(prev => [
      ...prev, 
      { status: 'failed', message: `❌ Connection Error: ${err.message}` }
    ]);
    setIsDeploying(false);
  }
};

  const handleSaveTradeConfig = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/trade-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: detectedChatId, config: tradeConfig })
      });
    } catch (e) {
      console.error("Save trade config error:", e);
    }
    setShowTradeConfig(false);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setTokenImage(ev.target.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
  <div className="min-h-screen w-full bg-[#020202] text-zinc-100 selection:bg-emerald-500/30 font-sans relative overflow-x-hidden">
    {/* Dynamic Background */}
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0" style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.08), transparent 40%)` }} />
      <StarField />
    </div>

    <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 text-left">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="relative -mt-4"> 
            <img src={botLogo} alt="Bot Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic leading-[0.8] bg-gradient-to-b from-white via-emerald-400 to-emerald-900 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(16,185,129,0.5)]">
              CUCUMVERSE
            </h1>
            <p className="text-emerald-500 text-[10px] font-bold tracking-[0.3em] uppercase mt-2 drop-shadow-sm">
              Deployment Terminal
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-2.5 w-fit mb-1 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <div className={`absolute inset-0 w-full h-full rounded-full animate-ping opacity-20 ${isTrading ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <div className={`w-2.5 h-2.5 rounded-full relative ${isTrading ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
          </div>
          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
            {isTrading ? 'Live Trade Active' : 'Solana Mainnet'}
          </span>
        </div>
      </div>

      <MainWalletCard key={walletAddress + balance} address={walletAddress} balance={balance} />

      {/* TABS NAVIGATION */}
      <div className="flex gap-4 sm:gap-8 mb-8 border-b border-zinc-800/50 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('tokens')} className={`pb-3 text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'tokens' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500'}`}>
          Token Setup
        </button>
        <button onClick={() => setActiveTab('wallets')} className={`pb-3 text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'wallets' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500'}`}>
          Manage Trade {isTrading && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />}
        </button>
      </div>

      {/* TOKEN SETUP TAB */}
      {activeTab === 'tokens' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className={`flex justify-center ${isTrading ? "opacity-40 grayscale pointer-events-none" : ""}`}>
            <button onClick={handleImageUpload} className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-zinc-900/40 border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden hover:border-emerald-500 transition-all">
              {tokenImage ? <img src={tokenImage} className="w-full h-full object-cover" alt="logo" /> : <Upload className="text-zinc-600" />}
            </button>
          </div>

          <div className={`space-y-6 ${isTrading ? "opacity-40 grayscale pointer-events-none" : ""}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Telegram Link" className="bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
              <input type="text" placeholder="X (Twitter) Link" className="bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
            </div>
            <input type="text" placeholder="Website URL" className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500" value={website} onChange={(e) => setWebsite(e.target.value)} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Token Name</label>
                <input className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500" placeholder="Cucumber Coin" value={tokenName} onChange={e => setTokenName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Symbol</label>
                <input className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500" placeholder="CUM" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} />
              </div>
            </div>

            <textarea className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 h-24 resize-none" placeholder="Description..." value={description} onChange={e => setDescription(e.target.value)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => setAutoBuy(!autoBuy)} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${autoBuy ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/40'}`}>
                <div className="flex items-center gap-2"><Sparkles size={18} className={autoBuy ? 'text-emerald-500' : 'text-zinc-500'} /><span className="text-sm font-bold">Auto-Buy</span></div>
                <div className={`w-8 h-4 rounded-full relative ${autoBuy ? 'bg-emerald-500' : 'bg-zinc-700'}`}><div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${autoBuy ? 'right-1' : 'left-1'}`} /></div>
              </button>
              <button onClick={() => setShowTradeConfig(true)} className="p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2"><Settings size={18} className="text-zinc-500" /><span className="text-sm font-bold">Trade Config</span></div>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className={`space-y-4 animate-in slide-in-from-top-4 duration-500 transition-all ${!deployResult?.tokenAddress ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between px-2">
              <h3 className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-400" /> Market Intelligence
              </h3>
              <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800">
                   <span className="text-emerald-500 font-mono text-xs font-bold">
                     {(deployResult?.tokenAddress && deployResult.tokenAddress.length > 30) 
                       ? `${deployResult.tokenAddress.slice(0,4)}...${deployResult.tokenAddress.slice(-4)}` 
                       : "$---"}
                   </span>
                   {deployResult?.tokenAddress && deployResult.tokenAddress.length > 30 && (
                     <button 
                       onClick={() => {
                         navigator.clipboard.writeText(deployResult.tokenAddress);
                         alert("Contract Address Copied!");
                       }}
                       className="text-zinc-500 hover:text-emerald-400 transition-colors ml-1"
                     >
                       <Copy size={12} />
                     </button>
                   )}
                   {deployResult && (
                     <div className="w-[1px] h-3 bg-zinc-700 mx-1" />
                   )}
                   {deployResult && (
                     <button 
                       onClick={() => { setDeployResult(null); setIsTrading(false); }}
                       className="text-zinc-500 hover:text-red-500 transition-colors"
                     >
                       <X size={14} />
                     </button>
                   )}
                 </div>
                 <span className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">
                   {deployResult?.symbol || "TOKEN"}
                 </span>
              </div>
            </div>
            
            <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden aspect-video relative group flex items-center justify-center bg-[#050505] shadow-inner shadow-black/50">
              
              {(deployResult?.tokenAddress && deployResult.tokenAddress.length > 30) ? (
                 <iframe 
                   src={`https://dexscreener.com/solana/${deployResult.tokenAddress}?embed=1&theme=dark&info=0`} 
                   className="w-full h-full border-0 absolute inset-0 z-30"
                   style={{ background: 'transparent' }}
                   title="DexScreener Chart"
                 />
              ) : (
                <>
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${deployResult?.tokenAddress ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="text-[9px] font-black text-white uppercase italic tracking-widest">{deployResult?.symbol ? `${deployResult.symbol} / SOL` : "PAIR / SOL"}</span>
                  </div>
                  <div className="text-center space-y-3 z-20">
                    {!deployResult?.tokenAddress ? (
                      <div className="flex flex-col items-center gap-2">
                        <Lock size={20} className="text-zinc-700" />
                        <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Market Feed Locked</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                         <div className="flex items-end gap-1 h-12 justify-center">
                            <div className="w-2 bg-emerald-500/20 h-4 rounded-full animate-bounce delay-75" />
                            <div className="w-2 bg-emerald-500/40 h-8 rounded-full animate-bounce delay-150" />
                            <div className="w-2 bg-emerald-500 h-6 rounded-full animate-bounce delay-200" />
                            <div className="w-2 bg-emerald-500/60 h-10 rounded-full animate-bounce delay-300" />
                         </div>
                         <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">Initializing Live Stream...</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {!isTrading && (
            <button onClick={handleDeployClick} disabled={isDeploying} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-emerald-900/20">
              {isDeploying ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Rocket size={24} className="mr-3" /><span className="font-black text-xl uppercase italic">Launch Token</span></>}
            </button>
          )}
        </div>
      )}
      
      {/* MANAGE TRADE TAB */}
      {activeTab === 'wallets' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex bg-zinc-900/50 p-1 rounded-xl w-fit border border-zinc-800">
            <button onClick={() => setWalletView('list')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${walletView === 'list' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500'}`}>Bot Wallets</button>
            <button onClick={() => setWalletView('logs')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${walletView === 'logs' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500'}`}>Trade Logs</button>
          </div>

          {walletView === 'list' ? (
            <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-3xl text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"><Activity size={16} className="text-emerald-400" /> Deployment Fleet</h3>
                {Array.isArray(wallets) && wallets.length > 0 && (
                  <button onClick={toggleSelectAll} className="text-[10px] font-bold text-emerald-500 uppercase" disabled={isTrading}>{selectAll ? 'Deselect All' : 'Select All'}</button>
                )}
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(wallets) && wallets.length > 0 ? (
                  wallets.map(w => <WalletCard key={w.id || w.address} wallet={w} isSelected={selectedWalletIds.has(w.id)} onSelect={toggleWallet} />)
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Initializing Fleet...</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <LogScreen logs={logs} onStop={handleStop} onSellAll={handleSellAll} onClear={() => setLogs([])} />
          )}

          {isTrading && (
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                 <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-tighter">System Locked • Bot Active</span>
               </div>
               <button onClick={handleStop} className="text-[9px] font-black text-white bg-red-600 px-3 py-1.5 rounded-md uppercase">Panic Stop</button>
            </div>
          )}
        </div>
      )}
    </div> {/* This closes the relative z-10 w-full max-w-2xl container */}

    {/* Modals & Overlays (Outside main layout but inside root div) */}
    <TradeConfigModal visible={showTradeConfig} onClose={() => setShowTradeConfig(false)} config={tradeConfig} setConfig={setTradeConfig} onSave={handleSaveTradeConfig} />

    <AnimatePresence>
      {showDeployConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4 sm:p-6 z-[60]">
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-[#0a0a0a] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 border border-zinc-800">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-6 uppercase italic text-left">Final Review</h2>
            <div className="space-y-4 mb-8 text-left">
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Token</span><span className="text-white font-bold">{tokenName} (${symbol})</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Bots</span><span className="text-emerald-400 font-bold">{selectedWalletIds.size} Active</span></div>
              <div className="text-left">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Initial Buy (SOL)</label>
                <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm" value={initialBuyAmount} onChange={e => setInitialBuyAmount(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeployConfirm(false)} className="flex-1 bg-zinc-900 py-4 rounded-xl text-zinc-400 font-bold text-xs uppercase">Cancel</button>
              <button onClick={handleConfirmDeploy} className="flex-1 bg-emerald-600 py-4 rounded-xl text-white font-black uppercase text-xs">Launch</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[70]">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0a0a0a] w-full max-w-md rounded-3xl p-6 sm:p-8 border border-emerald-500/30 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={32} className="text-emerald-500" /></div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase italic">Mission Success</h2>
            <div className="bg-zinc-900/50 p-4 rounded-2xl text-left border border-zinc-800 mb-8">
              <span className="text-[10px] text-zinc-600 font-black uppercase">Mint Address</span>
              <div className="text-white font-mono text-[10px] truncate bg-black/40 p-2 rounded-lg mt-1">{deployResult?.tokenAddress}</div>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full bg-blue-600 py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 text-xs uppercase">
              <Send size={18} /> Return to Bot
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
  );
}
