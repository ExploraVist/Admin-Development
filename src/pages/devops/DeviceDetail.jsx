import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { useDevice } from '../../hooks/useDevices';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const { data: device, loading } = useDevice(deviceId);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <LoadingSpinner size={28} />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--text-3)' }}>Device not found.</p>
        <Link to="/devops" style={{ color: 'var(--alt)' }}>Back to devices</Link>
      </div>
    );
  }

  const lastSeen = device.lastSeen?.toDate
    ? device.lastSeen.toDate()
    : device.lastSeen instanceof Date
    ? device.lastSeen
    : null;
  const isActive = lastSeen && (Date.now() - lastSeen.getTime()) < FIVE_MINUTES_MS;
  const createdAt = device.createdAt?.toDate
    ? device.createdAt.toDate()
    : device.createdAt instanceof Date
    ? device.createdAt
    : null;

  return (
    <div className="page-container">
      <Link to="/devops" className="td-back">
        <ArrowLeft size={16} />
        Back to devices
      </Link>

      <h1 className="page-title" style={{ marginBottom: 24 }}>{device.id}</h1>

      <div className="card" style={{ maxWidth: 500 }}>
        <div className="td-sidebar-row">
          <span className="td-sidebar-label">Type</span>
          <span className="device-type-badge">{device.type}</span>
        </div>
        <div className="td-sidebar-row">
          <span className="td-sidebar-label">Name</span>
          <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{device.name || '—'}</span>
        </div>
        <div className="td-sidebar-row">
          <span className="td-sidebar-label">Owner ID</span>
          <span style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'monospace' }}>{device.ownerId}</span>
        </div>
        <div className="td-sidebar-row">
          <span className="td-sidebar-label">Status</span>
          <span className={`device-status ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="td-sidebar-row">
          <span className="td-sidebar-label">Last Seen</span>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{lastSeen ? lastSeen.toLocaleString() : '—'}</span>
        </div>
        <div className="td-sidebar-row">
          <span className="td-sidebar-label">Created</span>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{createdAt ? createdAt.toLocaleString() : '—'}</span>
        </div>
      </div>
    </div>
  );
}
