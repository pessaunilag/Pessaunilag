import React from 'react'

const mark = (size: number) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="#141210" />
    <circle cx="32" cy="32" r="22" fill="none" stroke="#B8862E" strokeWidth="2" />
    <text x="32" y="38" textAnchor="middle" fontFamily="Georgia, serif" fontSize="17" fill="#F4EFE4">P</text>
  </svg>
)

export const Logo: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    {mark(44)}
    <div style={{ lineHeight: 1.1 }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, letterSpacing: '.02em' }}>PESSA UNILAG</div>
      <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', opacity: 0.7 }}>Website editor</div>
    </div>
  </div>
)

export const Icon: React.FC = () => mark(26)
