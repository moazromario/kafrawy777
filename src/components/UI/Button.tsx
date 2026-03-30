import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({ children, isLoading, ...props }: ButtonProps) {
  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      {...buttonProps}
      disabled={isLoading || buttonProps.disabled}
      className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
    >
      {isLoading ? 'جاري المعالجة...' : children}
    </button>
  );
}
