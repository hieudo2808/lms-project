import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  isLoading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    accent: 'bg-purple-600 text-white hover:bg-purple-700',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${
        className ?? ''
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Đang xử lý...' : children}
    </button>
  );
};
