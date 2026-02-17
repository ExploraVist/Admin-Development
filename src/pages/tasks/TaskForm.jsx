import { useState, useCallback } from 'react';
import { Modal } from '../../components/Modal';
import { useTaskActions } from '../../hooks/useTasks';
import { PRIORITIES } from '../../utils/constants';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function TaskForm({ open, onClose, teamSlug, parentTaskId = null, editTask = null }) {
  const { createTask, updateTask } = useTaskActions();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [priority, setPriority] = useState(editTask?.priority || 1);
  const [dueDate, setDueDate] = useState(
    editTask?.dueDate?.toDate ? editTask.dueDate.toDate().toISOString().split('T')[0] : ''
  );

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    setSaving(true);

    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        priority: Number(priority),
        dueDate: dueDate ? new Date(dueDate) : null,
        team: teamSlug,
        parentTaskId: parentTaskId || null,
      };

      if (editTask) {
        await updateTask(editTask.id, data);
      } else {
        await createTask(data);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [title, description, priority, dueDate, teamSlug, parentTaskId, editTask, createTask, updateTask, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={parentTaskId ? 'New Subtask' : editTask ? 'Edit Task' : 'New Task'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--red)', borderRadius: 4, color: 'var(--red)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div className="input-group">
          <label>Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="input-group">
            <label>Priority</label>
            <select className="select" value={priority} onChange={e => setPriority(Number(e.target.value))}>
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Due Date</label>
            <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || !title.trim()}>
            {saving ? <LoadingSpinner size={14} /> : editTask ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
