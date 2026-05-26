import React from 'react';

const COLORS = [
  '#1d9bf0','#f4212e','#00ba7c','#f7931a','#9b59b6',
  '#e67e22','#1abc9c','#e91e63','#2196f3','#ff5722'
];

function getColor(username) {
  if (!username) return COLORS[0];
  let hash = 0;
  for (let c of username) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

export default function Avatar({ user, size = 40, style = {} }) {
  const initials = user?.first_name
    ? user.first_name[0].toUpperCase()
    : user?.username?.[0]?.toUpperCase() || '?';

  const s = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: getColor(user?.username),
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: size * 0.38,
    color: 'white',
    ...style,
  };

  if (user?.avatar_url) {
    return (
      <div style={s}>
        <img
          src={user.avatar_url}
          alt={user.username}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>
    );
  }

  return <div style={s}>{initials}</div>;
}
