'use client';

import {
  type AdminUser,
  type BanFormState,
  type NewUserFormState,
} from '../types';
import { BanUserDialog } from './ban-user-dialog';
import { CreateUserDialog } from './create-user-dialog';
import { UsersTable } from './users-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { client } from '@/lib/auth/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const initialNewUser: NewUserFormState = {
  email: '',
  name: '',
  password: '',
  role: 'user',
};

const initialBanForm: BanFormState = {
  expirationDate: undefined,
  reason: '',
  userId: '',
};

type UsersSectionProps = {
  readonly showViewAll?: boolean;
};

export function UsersSection({ showViewAll = true }: UsersSectionProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUserFormState>(initialNewUser);
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState<BanFormState>(initialBanForm);

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryFn: async () => {
      const data = await client.admin.listUsers(
        {
          query: {
            limit: 10,
            sortBy: 'createdAt',
            sortDirection: 'desc',
          },
        },
        { throw: true },
      );
      return data?.users || [];
    },
    queryKey: ['users'],
  });

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users-count'] });
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading('create');
    try {
      await client.admin.createUser({
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        role: newUser.role,
      });
      toast.success('User created successfully');
      setNewUser(initialNewUser);
      setIsDialogOpen(false);
      invalidateUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create user';
      toast.error(errorMessage);
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(`delete-${id}`);
    try {
      await client.admin.removeUser({ userId: id });
      toast.success('User deleted successfully');
      invalidateUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    setIsLoading(`revoke-${id}`);
    try {
      await client.admin.revokeUserSessions({ userId: id });
      toast.success('Sessions revoked for user');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to revoke sessions';
      toast.error(errorMessage);
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleImpersonateUser = async (id: string) => {
    setIsLoading(`impersonate-${id}`);
    try {
      await client.admin.impersonateUser({ userId: id });
      toast.success('Impersonated user');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to impersonate user';
      toast.error(errorMessage);
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleBanClick = async (user: AdminUser) => {
    setBanForm({
      expirationDate: undefined,
      reason: '',
      userId: user.id,
    });

    if (user.banned) {
      setIsLoading(`ban-${user.id}`);
      try {
        await client.admin.unbanUser({ userId: user.id });
        toast.success('User unbanned successfully');
        invalidateUsers();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to unban user';
        toast.error(errorMessage);
      } finally {
        setIsLoading(undefined);
      }
    } else {
      setIsBanDialogOpen(true);
    }
  };

  const handleBanUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(`ban-${banForm.userId}`);
    try {
      if (!banForm.expirationDate) {
        throw new Error('Expiration date is required');
      }

      await client.admin.banUser({
        banExpiresIn: banForm.expirationDate.getTime() - Date.now(),
        banReason: banForm.reason,
        userId: banForm.userId,
      });
      toast.success('User banned successfully');
      setIsBanDialogOpen(false);
      invalidateUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to ban user';
      toast.error(errorMessage);
    } finally {
      setIsLoading(undefined);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>User Management</CardTitle>
          {showViewAll && (
            <Button
              asChild
              size="sm"
              variant="ghost"
            >
              <Link href="/admin/users">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <CreateUserDialog
          isLoading={isLoading === 'create'}
          isOpen={isDialogOpen}
          newUser={newUser}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateUser}
          onUserChange={setNewUser}
        />
        <BanUserDialog
          banForm={banForm}
          isLoading={isLoading === `ban-${banForm.userId}`}
          isOpen={isBanDialogOpen}
          onBanFormChange={setBanForm}
          onOpenChange={setIsBanDialogOpen}
          onSubmit={handleBanUser}
        />
      </CardHeader>
      <CardContent>
        {isUsersLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : users && users.length > 0 ? (
          <UsersTable
            isLoading={isLoading}
            onBanClick={handleBanClick}
            onDeleteClick={handleDeleteUser}
            onImpersonateClick={handleImpersonateUser}
            onRevokeSessionsClick={handleRevokeSessions}
            users={users}
          />
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No users found
          </p>
        )}
      </CardContent>
    </Card>
  );
}
