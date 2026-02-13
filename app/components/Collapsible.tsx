'use client'
import React from 'react';

type Props = {
  collapsed: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function Collapsible({ collapsed, children, className = '' }: Props) {
  // Versión simple: renderiza children solo cuando no está colapsado.
  return <div className={className}>{!collapsed ? children : null}</div>;
}
