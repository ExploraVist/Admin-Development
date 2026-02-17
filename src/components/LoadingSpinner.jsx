import { memo } from 'react';

export const LoadingSpinner = memo(function LoadingSpinner({ size = 24 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid var(--line)`,
        borderTopColor: 'var(--alt)',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
});

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('spinner-keyframes')) {
  const style = document.createElement('style');
  style.id = 'spinner-keyframes';
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}
