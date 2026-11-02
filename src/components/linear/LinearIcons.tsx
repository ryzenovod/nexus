import React from 'react';

export type LinearPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
export type LinearStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';

interface LinearIconProps {
  className?: string;
  size?: number;
}

/**
 * Linear Priority Icons (14x14)
 * - Urgent: Orange-red rounded square with exclamation mark
 * - High: 3 signal bars, all 3 active
 * - Medium: 3 signal bars, 2 active, 1 dimmed
 * - Low: 3 signal bars, 1 active, 2 dimmed
 * - None: 3 signal bars, all dimmed / dotted
 */
export const PriorityIcon: React.FC<LinearIconProps & { priority: LinearPriority }> = ({
  priority,
  size = 14,
  className = '',
}) => {
  switch (priority) {
    case 'urgent':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <rect x="1" y="1" width="12" height="12" rx="2.5" fill="#eb5757" />
          <path
            d="M7 4V8M7 10V10.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'high':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <rect x="2" y="8" width="2" height="4" rx="0.5" fill="#ededef" />
          <rect x="6" y="5.5" width="2" height="6.5" rx="0.5" fill="#ededef" />
          <rect x="10" y="3" width="2" height="9" rx="0.5" fill="#ededef" />
        </svg>
      );

    case 'medium':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <rect x="2" y="8" width="2" height="4" rx="0.5" fill="#ededef" />
          <rect x="6" y="5.5" width="2" height="6.5" rx="0.5" fill="#ededef" />
          <rect x="10" y="3" width="2" height="9" rx="0.5" fill="#383b47" />
        </svg>
      );

    case 'low':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <rect x="2" y="8" width="2" height="4" rx="0.5" fill="#ededef" />
          <rect x="6" y="5.5" width="2" height="6.5" rx="0.5" fill="#383b47" />
          <rect x="10" y="3" width="2" height="9" rx="0.5" fill="#383b47" />
        </svg>
      );

    case 'none':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="3" cy="10" r="1" fill="#5e636e" />
          <circle cx="7" cy="8.75" r="1" fill="#5e636e" />
          <circle cx="11" cy="7.5" r="1" fill="#5e636e" />
        </svg>
      );
  }
};

/**
 * Linear Status Icons (14x14)
 * - Backlog: Dotted grey circle
 * - Todo: Solid unfilled grey circle
 * - In Progress: Half-filled amber circle (filled on the right or clockwise half)
 * - Done: Solid indigo/purple circle with crisp white checkmark
 * - Cancelled: Grey circle with strikethrough / cross
 */
export const StatusIcon: React.FC<LinearIconProps & { status: LinearStatus }> = ({
  status,
  size = 14,
  className = '',
}) => {
  switch (status) {
    case 'backlog':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle
            cx="7"
            cy="7"
            r="5.25"
            stroke="#5e636e"
            strokeWidth="1.5"
            strokeDasharray="2.5 2"
          />
        </svg>
      );

    case 'todo':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle
            cx="7"
            cy="7"
            r="5.25"
            stroke="#8a8f98"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'in_progress':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          {/* Base outer circle */}
          <circle
            cx="7"
            cy="7"
            r="5.25"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          {/* Half-filled pie (right side) */}
          <path
            d="M7 1.75C9.8995 1.75 12.25 4.1005 12.25 7C12.25 9.8995 9.8995 12.25 7 12.25V1.75Z"
            fill="#f59e0b"
          />
        </svg>
      );

    case 'done':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="7" cy="7" r="6" fill="#5e6ad2" />
          <path
            d="M4.5 7.2L6.1 8.8L9.5 5.2"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'cancelled':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="7" cy="7" r="5.25" stroke="#5e636e" strokeWidth="1.5" />
          <line x1="3.5" y1="3.5" x2="10.5" y2="10.5" stroke="#5e636e" strokeWidth="1.5" />
        </svg>
      );

    default:
      return null;
  }
};
