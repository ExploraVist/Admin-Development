import { memo } from 'react';
import { STATUS_MAP } from '../utils/constants';

const STATUS_COLORS = {
  'not-started': { bg: '#333', color: '#aaa' },
  'in-progress': { bg: '#1e3a5f', color: '#65A9FD' },
  'in-review': { bg: '#4a3800', color: '#facc15' },
  'completed': { bg: '#14532d', color: '#4ade80' },
};

export const StatusBadge = memo(function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS['not-started'];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
        background: colors.bg,
        color: colors.color,
      }}
    >
      {STATUS_MAP[status] || status}
    </span>
  );
});
