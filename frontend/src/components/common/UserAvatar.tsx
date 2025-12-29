import { getInitials } from '../../utils';

interface UserAvatarProps {
    avatarUrl?: string | null;
    fullName: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
};

export const UserAvatar = ({ avatarUrl, fullName, size = 'md', className = '' }: UserAvatarProps) => {
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={fullName}
                className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
            />
        );
    }

    const initials = getInitials(fullName);
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
        'bg-orange-500',
        'bg-cyan-500',
    ];
    const colorIndex = fullName.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    return (
        <div
            className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
        >
            {initials}
        </div>
    );
};
