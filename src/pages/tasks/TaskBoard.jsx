import { useState, useCallback, useMemo, memo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useTeamTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { STATUSES, TEAM_MAP } from '../../utils/constants';
import TaskForm from './TaskForm';
import '../../styles/taskboard.css';

const TaskRow = memo(function TaskRow({ task, teamSlug }) {
  return (
    <tr>
      <td>
        <Link to={`/tasks/${teamSlug}/${task.id}`} className="task-link">
          {task.title}
        </Link>
      </td>
      <td><StatusBadge status={task.status} /></td>
      <td><PriorityBadge priority={task.priority} /></td>
      <td style={{ color: 'var(--text-3)', fontSize: 13 }}>
        {task.assigneeName || <span style={{ opacity: 0.5 }}>Unassigned</span>}
      </td>
      <td style={{ color: 'var(--text-3)', fontSize: 13 }}>
        {task.dueDate?.toDate ? task.dueDate.toDate().toLocaleDateString() : '—'}
      </td>
    </tr>
  );
});

export default function TaskBoard() {
  const { teamSlug } = useParams();
  const { isAdmin, adminUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Check team access
  const hasAccess = useMemo(() => {
    if (isAdmin) return true;
    return (adminUser?.teams || []).includes(teamSlug);
  }, [isAdmin, adminUser?.teams, teamSlug]);

  const { data: tasks, loading } = useTeamTasks(hasAccess ? teamSlug : null, statusFilter);

  const handleFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value || null);
  }, []);

  const handleOpenForm = useCallback(() => setShowForm(true), []);
  const handleCloseForm = useCallback(() => setShowForm(false), []);

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const teamLabel = TEAM_MAP[teamSlug] || teamSlug;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{teamLabel}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="taskboard-filter">
            <Filter size={14} />
            <select className="select" value={statusFilter || ''} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleOpenForm}>
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <LoadingSpinner size={28} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="taskboard-empty">
          <p>No tasks{statusFilter ? ` with status "${statusFilter}"` : ''} for this team.</p>
          <button className="btn btn-secondary" onClick={handleOpenForm}>Create the first task</button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <TaskRow key={task.id} task={task} teamSlug={teamSlug} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaskForm
        open={showForm}
        onClose={handleCloseForm}
        teamSlug={teamSlug}
      />
    </div>
  );
}
