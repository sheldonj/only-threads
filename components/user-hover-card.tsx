'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils/cn';
import { Mail, ShieldCheck, User } from 'lucide-react';

type UserHoverCardProps = {
  readonly className?: string;
  readonly email?: null | string;
  readonly image?: null | string;
  readonly name?: null | string;
  readonly role?: null | string;
  readonly showEmail?: boolean;
  readonly size?: 'lg' | 'md' | 'sm';
};

function getInitials(name?: null | string, email?: null | string): string {
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  }

  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return '??';
}

const sizeClasses = {
  lg: 'h-10 w-10 text-sm',
  md: 'h-8 w-8 text-xs',
  sm: 'h-6 w-6 text-[10px]',
};

export function UserHoverCard({
  className,
  email,
  image,
  name,
  role,
  showEmail = false,
  size = 'md',
}: UserHoverCardProps) {
  const initials = getInitials(name, email);
  const isAdmin = role === 'admin';

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-md transition-opacity hover:opacity-80',
            className,
          )}
          type="button"
        >
          <Avatar className={sizeClasses[size]}>
            {image && (
              <AvatarImage
                alt={name || email || 'User'}
                src={image}
              />
            )}
            <AvatarFallback
              className={cn(
                isAdmin ? 'bg-primary/20 text-primary' : 'bg-muted',
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          {showEmail && <span className="text-sm">{email || 'Unknown'}</span>}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-72"
      >
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            {image && (
              <AvatarImage
                alt={name || email || 'User'}
                src={image}
              />
            )}
            <AvatarFallback
              className={cn(
                'text-base',
                isAdmin ? 'bg-primary/20 text-primary' : 'bg-muted',
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">
                {name || 'Unknown User'}
              </h4>
              {isAdmin && (
                <Badge
                  className="h-5 gap-1 px-1.5"
                  variant="default"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
            {email && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="text-xs">{email}</span>
              </div>
            )}
            {role && !isAdmin && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="text-xs capitalize">{role}</span>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
