import { useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wifi, WifiOff } from 'lucide-react';
import { useDevices } from '../../hooks/useDevices';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import '../../styles/devices.css';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const DeviceRow = memo(function DeviceRow({ device }) {
  const lastSeen = device.lastSeen?.toDate
    ? device.lastSeen.toDate()
    : device.lastSeen instanceof Date
    ? device.lastSeen
    : null;

  const isActive = lastSeen && (Date.now() - lastSeen.getTime()) < FIVE_MINUTES_MS;

  return (
    <tr>
      <td>
        <Link to={`/devops/${device.id}`} className="task-link">{device.id}</Link>
      </td>
      <td>
        <span className="device-type-badge">{device.type}</span>
      </td>
      <td style={{ color: 'var(--text-2)' }}>{device.name || '—'}</td>
      <td>
        <span className={`device-status ${isActive ? 'active' : 'inactive'}`}>
          {isActive ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td style={{ color: 'var(--text-3)', fontSize: 13 }}>
        {lastSeen ? lastSeen.toLocaleString() : '—'}
      </td>
    </tr>
  );
});

export default function DeviceList() {
  const { data: devices, loading } = useDevices();
  const { isAdmin } = useAuth();

  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      const aTime = a.lastSeen?.toDate?.()?.getTime() || 0;
      const bTime = b.lastSeen?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });
  }, [devices]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Devices ({devices.length})</h1>
        {isAdmin && (
          <Link to="/devops/mint" className="btn btn-primary">
            <Plus size={16} />
            Mint Device
          </Link>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <LoadingSpinner size={28} />
        </div>
      ) : devices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
          <p>No devices registered yet.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Type</th>
                <th>Name</th>
                <th>Status</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {sortedDevices.map(d => (
                <DeviceRow key={d.id} device={d} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
