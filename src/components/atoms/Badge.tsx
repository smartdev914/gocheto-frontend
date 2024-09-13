'use client'
import React, { FC, ReactNode, useState } from 'react';

export interface BadgeProps {
  id?: string;
  type?: 'danger' | 'success';
  className?: string;
  dismissable?: boolean;
  children?: ReactNode;
  onDismiss?: () => void;
}

export const Badge: FC<BadgeProps> = ({
  dismissable = false,
  className,
  type,
  children,
  onDismiss,
}) => {

  const successStyle = {
    backgroundColor: '#AAE5CC',
    color: '#0AA663',
  }

  const dangerStyle = {
    backgroundColor: '#FAD1D8',
    color: '#E81738',
  }

  const handleDismiss = () => {
    onDismiss?.();
  };

  return (
      <span
        style={type === 'success' ? successStyle : dangerStyle}
        className={`border border-solid shadow-sm flex items-center gap-2 px-2 py-1 rounded w-fit ${className}`}
      >
        {children}
        <span className={'w-2 h-2 rounded-full'} style={{ backgroundColor: type === 'success' ? '#0AA663' : '#E81738'}} />
        {dismissable && (
          <span onClick={handleDismiss}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ml-1 cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        )}
      </span>
  );
};