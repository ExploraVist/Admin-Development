import { useCallback, useMemo, memo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Shield, UserCheck, UserX } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery';
import { useAuth } from '../hooks/useAuth';
import { TEAMS } from '../utils/constants';
import { LoadingSpinner } from '../components/LoadingSpinner';
import '../styles/permissions.css';

const UserRow = memo(function UserRow({ adminUserDoc, onToggleTeam, onChangeRole }) {
  const teams = adminUserDoc.teams || [];

  return (
    <tr>
      <td>
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{adminUserDoc.displayName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{adminUserDoc.email}</div>
        </div>
      </td>
      <td>
        <select
          className="select"
          value={adminUserDoc.role}
          onChange={(e) => onChangeRole(adminUserDoc.id, e.target.value)}
          style={{ minWidth: 100 }}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td>
        <div className="perm-team-chips">
          {TEAMS.map(team => (
            <button
              key={team.slug}
              className={`perm-team-chip ${teams.includes(team.slug) ? 'active' : ''}`}
              onClick={() => onToggleTeam(adminUserDoc.id, team.slug, teams)}
            >
              {team.label}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
});

const PendingRow = memo(function PendingRow({ user, onApprove, onReject }) {
  const createdAt = user.createdAt?.toDate
    ? user.createdAt.toDate().toLocaleDateString()
    : '—';

  return (
    <div className="pending-request">
      <div className="pending-request-info">
        <div style={{ fontWeight: 500, color: 'var(--text)' }}>{user.displayName}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{user.email}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Requested {createdAt}</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-primary btn-sm" onClick={() => onApprove(user.id)}>
          <UserCheck size={14} />
          Approve
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onReject(user.id)}>
          <UserX size={14} />
          Reject
        </button>
      </div>
    </div>
  );
});

export default function Permissions() {
  const { isAdmin } = useAuth();

  const usersQuery = useMemo(() => {
    return query(collection(db, 'adminUsers'), orderBy('createdAt', 'asc'));
  }, []);

  const { data: allUsers, loading } = useFirestoreQuery(usersQuery);

  const pendingUsers = useMemo(() => {
    return allUsers.filter(u => u.status === 'pending');
  }, [allUsers]);

  const approvedUsers = useMemo(() => {
    return allUsers.filter(u => u.status !== 'pending');
  }, [allUsers]);

  const handleApprove = useCallback(async (userId) => {
    const ref = doc(db, 'adminUsers', userId);
    await updateDoc(ref, { status: 'approved' });
  }, []);

  const handleReject = useCallback(async (userId) => {
    if (!window.confirm('Reject and remove this account request?')) return;
    await deleteDoc(doc(db, 'adminUsers', userId));
  }, []);

  const handleToggleTeam = useCallback(async (userId, teamSlug, currentTeams) => {
    const ref = doc(db, 'adminUsers', userId);
    const updatedTeams = currentTeams.includes(teamSlug)
      ? currentTeams.filter(t => t !== teamSlug)
      : [...currentTeams, teamSlug];
    await updateDoc(ref, { teams: updatedTeams });
  }, []);

  const handleChangeRole = useCallback(async (userId, newRole) => {
    const ref = doc(db, 'adminUsers', userId);
    await updateDoc(ref, { role: newRole });
  }, []);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Shield size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Permissions
        </h1>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="pending-section">
          <h3 className="pending-section-title">
            Pending Approvals
            <span className="pending-count">{pendingUsers.length}</span>
          </h3>
          <div className="pending-list">
            {pendingUsers.map(u => (
              <PendingRow
                key={u.id}
                user={u}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      )}

      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 20 }}>
        Assign team access and roles. Members can only see teams they're assigned to. Admins see all teams.
      </p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Teams</th>
              </tr>
            </thead>
            <tbody>
              {approvedUsers.map(u => (
                <UserRow
                  key={u.id}
                  adminUserDoc={u}
                  onToggleTeam={handleToggleTeam}
                  onChangeRole={handleChangeRole}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
