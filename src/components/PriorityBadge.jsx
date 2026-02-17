import { memo } from 'react';
import { PRIORITY_MAP } from '../utils/constants';

export const PriorityBadge = memo(function PriorityBadge({ priority }) {
  const p = PRIORITY_MAP[priority];
  if (!p) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        color: p.color,
        fontWeight: 500,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
      {p.label}
    </span>
  );
});
