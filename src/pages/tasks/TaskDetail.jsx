import { useState, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc } from 'firebase/firestore';
import { ArrowLeft, UserPlus, UserMinus, Trash2, Edit, Plus, Send } from 'lucide-react';
import { db } from '../../firebase';
import { useFirestoreDoc } from '../../hooks/useFirestoreQuery';
import { useSubtasks, useTaskActions } from '../../hooks/useTasks';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { STATUSES } from '../../utils/constants';
import TaskForm from './TaskForm';
import '../../styles/taskdetail.css';

const CommentItem = memo(function CommentItem({ comment }) {
  const date = comment.createdAt?.toDate
    ? comment.createdAt.toDate().toLocaleString()
    : '';
  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{comment.authorName}</span>
        <span className="comment-date">{date}</span>
      </div>
      <p className="comment-text">{comment.text}</p>
    </div>
  );
});

export default function TaskDetail() {
  const { teamSlug, taskId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { updateTask, deleteTask, claimTask, unclaimTask } = useTaskActions();

  const docRef = useMemo(() => doc(db, 'tasks', taskId), [taskId]);
  const { data: task, loading } = useFirestoreDoc(docRef);
  const { data: subtasks } = useSubtasks(taskId);
  const { comments, addComment } = useComments(taskId);

  const [commentText, setCommentText] = useState('');
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = isAdmin || task?.assigneeId === user?.uid || task?.createdBy === user?.uid;

  const handleStatusChange = useCallback(async (e) => {
    await updateTask(taskId, { status: e.target.value });
  }, [taskId, updateTask]);

  const handleClaim = useCallback(async () => {
    await claimTask(taskId);
  }, [taskId, claimTask]);

  const handleUnclaim = useCallback(async () => {
    await unclaimTask(taskId);
  }, [taskId, unclaimTask]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(true);
    await deleteTask(taskId);
    navigate(`/tasks/${teamSlug}`);
  }, [taskId, teamSlug, deleteTask, navigate]);

  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(commentText);
    setCommentText('');
  }, [commentText, addComment]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <LoadingSpinner size={28} />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--text-3)' }}>Task not found.</p>
        <Link to={`/tasks/${teamSlug}`} style={{ color: 'var(--alt)' }}>Back to board</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to={`/tasks/${teamSlug}`} className="td-back">
        <ArrowLeft size={16} />
        Back to {teamSlug}
      </Link>

      <div className="td-header">
        <div>
          <h1 className="td-title">{task.title}</h1>
          <div className="td-meta">
            <PriorityBadge priority={task.priority} />
            <span style={{ color: 'var(--text-3)', fontSize: 13 }}>
              by {task.createdByName}
            </span>
            {task.dueDate?.toDate && (
              <span style={{ color: 'var(--text-3)', fontSize: 13 }}>
                Due: {task.dueDate.toDate().toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="td-actions">
          {canEdit && (
            <select className="select" value={task.status} onChange={handleStatusChange}>
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}
          {!task.assigneeId && (
            <button className="btn btn-secondary btn-sm" onClick={handleClaim}>
              <UserPlus size={14} /> Claim
            </button>
          )}
          {task.assigneeId === user?.uid && (
            <button className="btn btn-secondary btn-sm" onClick={handleUnclaim}>
              <UserMinus size={14} /> Unclaim
            </button>
          )}
          {canEdit && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowEditForm(true)}>
              <Edit size={14} />
            </button>
          )}
          {(isAdmin || task.createdBy === user?.uid) && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="td-body">
        <div className="td-main">
          {task.description && (
            <div className="card" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {task.description}
              </p>
            </div>
          )}

          {/* Subtasks */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>
                Subtasks {subtasks.length > 0 && `(${subtasks.length})`}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSubtaskForm(true)}>
                <Plus size={14} /> Add
              </button>
            </div>
            {subtasks.length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No subtasks yet.</p>
            ) : (
              <div className="td-subtask-list">
                {subtasks.map(st => (
                  <Link key={st.id} to={`/tasks/${teamSlug}/${st.id}`} className="td-subtask-item">
                    <StatusBadge status={st.status} />
                    <span>{st.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
              Comments {comments.length > 0 && `(${comments.length})`}
            </h3>
            <div className="td-comments">
              {comments.map(c => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </div>
            <form onSubmit={handleSubmitComment} className="td-comment-form">
              <input
                className="input"
                placeholder="Add a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={!commentText.trim()}>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

        <div className="td-sidebar">
          <div className="card">
            <div className="td-sidebar-row">
              <span className="td-sidebar-label">Status</span>
              <StatusBadge status={task.status} />
            </div>
            <div className="td-sidebar-row">
              <span className="td-sidebar-label">Priority</span>
              <PriorityBadge priority={task.priority} />
            </div>
            <div className="td-sidebar-row">
              <span className="td-sidebar-label">Assignee</span>
              <span style={{ fontSize: 14, color: task.assigneeName ? 'var(--text-2)' : 'var(--text-3)' }}>
                {task.assigneeName || 'Unassigned'}
              </span>
            </div>
            <div className="td-sidebar-row">
              <span className="td-sidebar-label">Created</span>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showSubtaskForm && (
        <TaskForm
          open={showSubtaskForm}
          onClose={() => setShowSubtaskForm(false)}
          teamSlug={teamSlug}
          parentTaskId={taskId}
        />
      )}

      {showEditForm && (
        <TaskForm
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          teamSlug={teamSlug}
          editTask={task}
        />
      )}
    </div>
  );
}
