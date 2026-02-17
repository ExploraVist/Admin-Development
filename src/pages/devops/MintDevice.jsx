import { useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useMintDevice } from '../../hooks/useDevices';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function MintDevice() {
  const { isAdmin } = useAuth();
  const { mint } = useMintDevice();
  const [type, setType] = useState('app');
  const [name, setName] = useState('');
  const [minting, setMinting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  if (!isAdmin) return <Navigate to="/devops" replace />;

  const handleMint = useCallback(async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setMinting(true);
    try {
      const res = await mint({ type, name: name.trim() });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setMinting(false);
    }
  }, [type, name, mint]);

  const handleCopy = useCallback(async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <div className="page-container">
      <Link to="/devops" className="td-back">
        <ArrowLeft size={16} />
        Back to devices
      </Link>

      <h1 className="page-title" style={{ marginBottom: 24 }}>Mint New Device</h1>

      {result ? (
        <div className="card" style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(74,222,128,0.15)', color: 'var(--green)', borderRadius: 4, fontSize: 13, fontWeight: 500 }}>
              Device created successfully
            </span>
          </div>

          <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
            Save the secret now — it will not be shown again.
          </p>

          <div className="mint-field">
            <label>Device ID</label>
            <div className="mint-value">
              <code>{result.deviceId}</code>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(result.deviceId, 'id')}>
                {copied === 'id' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="mint-field">
            <label>Secret</label>
            <div className="mint-value">
              <code style={{ wordBreak: 'break-all' }}>{result.secret}</code>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(result.secret, 'secret')}>
                {copied === 'secret' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={() => { setResult(null); setName(''); }}>
              Mint Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleMint} className="card" style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--red)', borderRadius: 4, color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="input-group">
            <label>Type</label>
            <select className="select" value={type} onChange={e => setType(e.target.value)}>
              <option value="app">App</option>
              <option value="hardware">Hardware</option>
            </select>
          </div>

          <div className="input-group">
            <label>Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. iPhone 15 Pro" required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={minting || !name.trim()}>
            {minting ? <LoadingSpinner size={14} /> : 'Mint Device'}
          </button>
        </form>
      )}
    </div>
  );
}
