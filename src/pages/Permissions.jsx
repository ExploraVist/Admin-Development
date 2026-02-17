import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { Save, Shield } from 'lucide-react';
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

export default function Permissions() {
  const { isAdmin } = useAuth();

  const usersQuery = useMemo(() => {
    return query(collection(db, 'adminUsers'), orderBy('createdAt', 'asc'));
  }, []);

  const { data: users, loading } = useFirestoreQuery(usersQuery);

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
              {users.map(u => (
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
