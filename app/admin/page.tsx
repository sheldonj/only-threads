'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { client } from '@/lib/auth/client';
import { cn } from '@/lib/utils/cn';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  UserCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user' as const,
  });
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    expirationDate: undefined as Date | undefined,
    reason: '',
    userId: '',
  });

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
        {
          throw: true,
        },
      );
      return data?.users || [];
    },
    queryKey: ['users'],
  });

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
      setNewUser({ email: '', name: '', password: '', role: 'user' });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
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
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
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
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to ban user';
      toast.error(errorMessage);
    } finally {
      setIsLoading(undefined);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Toaster richColors />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <Dialog
            onOpenChange={setIsDialogOpen}
            open={isDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={handleCreateUser}
              >
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    onChange={(event) =>
                      setNewUser({
                        ...newUser,
                        email: event.target.value,
                      })
                    }
                    required
                    type="email"
                    value={newUser.email}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    onChange={(event) =>
                      setNewUser({
                        ...newUser,
                        password: event.target.value,
                      })
                    }
                    required
                    type="password"
                    value={newUser.password}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    onChange={(event) =>
                      setNewUser({
                        ...newUser,
                        name: event.target.value,
                      })
                    }
                    required
                    value={newUser.name}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    onValueChange={(value: 'admin' | 'user') =>
                      setNewUser({
                        ...newUser,
                        role: value as 'user',
                      })
                    }
                    value={newUser.role}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  disabled={isLoading === 'create'}
                  type="submit"
                >
                  {isLoading === 'create' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog
            onOpenChange={setIsBanDialogOpen}
            open={isBanDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={handleBanUser}
              >
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    onChange={(event) =>
                      setBanForm({
                        ...banForm,
                        reason: event.target.value,
                      })
                    }
                    required
                    value={banForm.reason}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !banForm.expirationDate && 'text-muted-foreground',
                        )}
                        id="expirationDate"
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {banForm.expirationDate ? (
                          format(banForm.expirationDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        initialFocus
                        mode="single"
                        onSelect={(date) =>
                          setBanForm({
                            ...banForm,
                            expirationDate: date,
                          })
                        }
                        selected={banForm.expirationDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  className="w-full"
                  disabled={isLoading === `ban-${banForm.userId}`}
                  type="submit"
                >
                  {isLoading === `ban-${banForm.userId}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Banning...
                    </>
                  ) : (
                    'Ban User'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Banned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.role || 'user'}</TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          disabled={isLoading?.startsWith('delete')}
                          onClick={() => handleDeleteUser(user.id)}
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
                          onClick={() => handleRevokeSessions(user.id)}
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
                          onClick={() => handleImpersonateUser(user.id)}
                          size="sm"
                          variant="secondary"
                        >
                          {isLoading === `impersonate-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserCircle className="h-4 w-4 mr-2" />
                              Impersonate
                            </>
                          )}
                        </Button>
                        <Button
                          disabled={isLoading?.startsWith('ban')}
                          onClick={async () => {
                            setBanForm({
                              expirationDate: undefined,
                              reason: '',
                              userId: user.id,
                            });
                            if (user.banned) {
                              setIsLoading(`ban-${user.id}`);
                              await client.admin.unbanUser(
                                {
                                  userId: user.id,
                                },
                                {
                                  onError(context) {
                                    toast.error(
                                      context.error.message ||
                                        'Failed to unban user',
                                    );
                                    setIsLoading(undefined);
                                  },
                                  onSuccess() {
                                    queryClient.invalidateQueries({
                                      queryKey: ['users'],
                                    });
                                    toast.success('User unbanned successfully');
                                  },
                                },
                              );
                              queryClient.invalidateQueries({
                                queryKey: ['users'],
                              });
                            } else {
                              setIsBanDialogOpen(true);
                            }
                          }}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
