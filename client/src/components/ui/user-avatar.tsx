import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { VerificationBadge } from "./verification-badge";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: {
    fullName?: string;
    full_name?: string;
    profilePhoto?: string;
    profile_photo?: string;
    isVerified?: boolean;
    is_verified?: boolean;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showVerificationBadge?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-16 w-16",
  xl: "h-24 w-24"
};

const badgeSizeMap = {
  sm: "sm" as const,
  md: "sm" as const,
  lg: "md" as const,
  xl: "lg" as const
};

export function UserAvatar({ 
  user, 
  size = "md", 
  className,
  showVerificationBadge = true 
}: UserAvatarProps) {
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return '?';
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle case when user is undefined
  if (!user) {
    return (
      <div className="relative inline-block">
        <Avatar className={cn(sizeClasses[size], className)}>
          <AvatarFallback className="text-white font-bold bg-gray-400">
            ?
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        {user.profile_photo && (
          <AvatarImage 
            src={user.profile_photo} 
            alt={user.full_name || 'Usuário'}
            className="object-cover"
          />
        )}
        <AvatarFallback 
          className="text-white font-bold"
          style={{ 
            background: 'linear-gradient(135deg, #1B2B49 0%, #41B6FF 100%)' 
          }}
        >
          {getInitials(user.full_name || '')}
        </AvatarFallback>
      </Avatar>
      
      {showVerificationBadge && user.is_verified && (
        <VerificationBadge 
          isVerified={user.is_verified || false}
          size={badgeSizeMap[size]}
        />
      )}
    </div>
  );
}