'use client';

import { type AdminUser } from '../types';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Trash, UserCircle } from 'lucide-react';

type UserActionButtonsProps = {
  readonly isLoading: string | undefined;
  readonly onBanClick: (user: AdminUser) => void;
  readonly onDeleteClick: (userId: string) => void;
  readonly onImpersonateClick: (userId: string) => void;
  readonly onRevokeSessionsClick: (userId: string) => void;
  readonly user: AdminUser;
};

export function UserActionButtons({
  isLoading,
  onBanClick,
  onDeleteClick,
  onImpersonateClick,
  onRevokeSessionsClick,
  user,
}: UserActionButtonsProps) {
  return (
    <div className="flex space-x-2">
      <Button
        disabled={isLoading?.startsWith('delete')}
        onClick={() => onDeleteClick(user.id)}
        size="sm"
        variant="destructive"
      >
        {isLoading === `delete-${user.id}` ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash className="h-4 w-4" />
        )}
      </Button>
      <Button
        disabled={isLoading?.startsWith('revoke')}
        onClick={() => onRevokeSessionsClick(user.id)}
        size="sm"
        variant="outline"
      >
        {isLoading === `revoke-${user.id}` ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
      <Button
        disabled={isLoading?.startsWith('impersonate')}
        onClick={() => onImpersonateClick(user.id)}
        size="sm"
        variant="secondary"
      >
        {isLoading === `impersonate-${user.id}` ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <UserCircle className="mr-2 h-4 w-4" />
            Impersonate
          </>
        )}
      </Button>
      <Button
        disabled={isLoading?.startsWith('ban')}
        onClick={() => onBanClick(user)}
        size="sm"
        variant="outline"
      >
        {isLoading === `ban-${user.id}` ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : user.banned ? (
          'Unban'
        ) : (
          'Ban'
        )}
      </Button>
    </div>
  );
}
