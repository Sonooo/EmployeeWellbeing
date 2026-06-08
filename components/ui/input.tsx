import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ error, fullWidth, className = '', ...props }, ref) => {
    const baseStyle =
      'w-full px-4 py-2 text-sm border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none';

    const borderStyle = error
      ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100'
      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500';

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <>
        <input
          ref={ref}
          className={`${baseStyle} ${borderStyle} ${widthStyle} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      </>
    );
  }
);

Input.displayName = 'Input';
