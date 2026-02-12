import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCqla6NiVTpkqAmT5_1gTHWwT4gtPKj0LnxWk-N6LlgysGTHiEJT6Ucbo0HG4iZH5IybNMOZOst5Dn3G0v5xa0BIRebPb3rEFE-iMNSjA49lwhlhPTJvpIrpZlhkwIHS0QbL3_ehAnj8kvA6jKltgZCvndjPC6T9sRT8A3ibiViYYsYdJvD097PhHqE4AuVc6nVkJP-y4aO1WzQFSE37qeDS0azjKXkM2mkCx_1V-ZBE5bJ8eJBtlMb43VeAZ4-5Jbq6hsOvfu_j0U",
  alt = "Profile",
  size = 'md',
  className = ""
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 cursor-pointer hover:ring-2 ring-primary transition-all shrink-0 ${className}`}>
      <img 
        className="w-full h-full object-cover" 
        alt={alt} 
        src={src}
      />
    </div>
  );
};

export default Avatar;
