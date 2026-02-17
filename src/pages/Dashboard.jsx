import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useMyTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TEAMS, TEAM_MAP } from '../utils/constants';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { adminUser, isAdmin } = useAuth();
  const { data: myTasks, loading } = useMyTasks();

  const visibleTeams = useMemo(() => {
    if (isAdmin) return TEAMS;
    const userTeams = adminUser?.teams || [];
    return TEAMS.filter(t => userTeams.includes(t.slug));
  }, [isAdmin, adminUser?.teams]);

  const upcomingTasks = useMemo(() => {
    if (!myTasks) return [];
    return myTasks
      .filter(t => t.dueDate)
      .sort((a, b) => {
        const aTime = a.dueDate?.seconds || 0;
        const bTime = b.dueDate?.seconds || 0;
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [myTasks]);

  const stats = useMemo(() => {
    if (!myTasks) return { total: 0, inProgress: 0, inReview: 0 };
    return {
      total: myTasks.length,
      inProgress: myTasks.filter(t => t.status === 'in-progress').length,
      inReview: myTasks.filter(t => t.status === 'in-review').length,
    };
  }, [myTasks]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Welcome, {adminUser?.displayName}</h1>
      </div>

      <div className="dash-stats">
        <div className="dash-stat-card">
          <AlertCircle size={20} style={{ color: 'var(--alt)' }} />
          <div className="dash-stat-value">{stats.total}</div>
          <div className="dash-stat-label">My Tasks</div>
        </div>
        <div className="dash-stat-card">
          <Clock size={20} style={{ color: 'var(--yellow)' }} />
          <div className="dash-stat-value">{stats.inProgress}</div>
          <div className="dash-stat-label">In Progress</div>
        </div>
        <div className="dash-stat-card">
          <CheckCircle size={20} style={{ color: 'var(--green)' }} />
          <div className="dash-stat-value">{stats.inReview}</div>
          <div className="dash-stat-label">In Review</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>My Tasks</h3>
          {myTasks.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No tasks assigned to you.</p>
          ) : (
            <div className="dash-task-list">
              {myTasks.slice(0, 10).map(task => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.team}/${task.id}`}
                  className="dash-task-item"
                >
                  <div className="dash-task-info">
                    <span className="dash-task-title">{task.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{TEAM_MAP[task.team]}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Upcoming Due Dates</h3>
          {upcomingTasks.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No upcoming deadlines.</p>
          ) : (
            <div className="dash-task-list">
              {upcomingTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.team}/${task.id}`}
                  className="dash-task-item"
                >
                  <div className="dash-task-info">
                    <span className="dash-task-title">{task.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      Due: {task.dueDate?.toDate ? task.dueDate.toDate().toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <StatusBadge status={task.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Your Teams</h3>
        <div className="dash-teams">
          {visibleTeams.map(team => (
            <Link key={team.slug} to={`/tasks/${team.slug}`} className="dash-team-link">
              <span>{team.label}</span>
              <ArrowRight size={16} />
            </Link>
          ))}
          {visibleTeams.length === 0 && (
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
              No teams assigned yet. Ask an admin to add you to a team.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
