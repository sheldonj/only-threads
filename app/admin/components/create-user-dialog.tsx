'use client';

import { type NewUserFormState } from '../types';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';

type CreateUserDialogProps = {
  readonly isLoading: boolean;
  readonly isOpen: boolean;
  readonly newUser: NewUserFormState;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (event: React.FormEvent) => void;
  readonly onUserChange: (user: NewUserFormState) => void;
};

export function CreateUserDialog({
  isLoading,
  isOpen,
  newUser,
  onOpenChange,
  onSubmit,
  onUserChange,
}: CreateUserDialogProps) {
  return (
    <Dialog
      onOpenChange={onOpenChange}
      open={isOpen}
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
          onSubmit={onSubmit}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              onChange={(event) =>
                onUserChange({
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
                onUserChange({
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
                onUserChange({
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
                onUserChange({
                  ...newUser,
                  role: value,
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
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
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
  );
}
