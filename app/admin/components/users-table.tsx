'use client';

import { type AdminUser } from '../types';
import { UserActionButtons } from './user-action-buttons';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserHoverCard } from '@/components/user-hover-card';

type UsersTableProps = {
  readonly isLoading: string | undefined;
  readonly onBanClick: (user: AdminUser) => void;
  readonly onDeleteClick: (userId: string) => void;
  readonly onImpersonateClick: (userId: string) => void;
  readonly onRevokeSessionsClick: (userId: string) => void;
  readonly users: AdminUser[];
};

export function UsersTable({
  isLoading,
  onBanClick,
  onDeleteClick,
  onImpersonateClick,
  onRevokeSessionsClick,
  users,
}: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <UserHoverCard
                email={user.email}
                image={user.image}
                name={user.name}
                role={user.role}
                showEmail
              />
            </TableCell>
            <TableCell>
              <span className="capitalize">{user.role || 'user'}</span>
            </TableCell>
            <TableCell>
              {user.banned ? (
                <Badge variant="destructive">Banned</Badge>
              ) : (
                <Badge variant="outline">Active</Badge>
              )}
            </TableCell>
            <TableCell>
              <UserActionButtons
                isLoading={isLoading}
                onBanClick={onBanClick}
                onDeleteClick={onDeleteClick}
                onImpersonateClick={onImpersonateClick}
                onRevokeSessionsClick={onRevokeSessionsClick}
                user={user}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
