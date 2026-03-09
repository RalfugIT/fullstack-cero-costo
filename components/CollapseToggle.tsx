'use client'
import React from 'react';

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
  title?: string;
};

export default function CollapseToggle({ collapsed, onToggle, className = '', title }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      title={title}
      className={`p-3 m-1 rounded-md text-slate-300 hover:bg-slate-700/50 ${className}`}
    >
      <svg className={`w-5 h-5 transform transition-transform ${collapsed ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
