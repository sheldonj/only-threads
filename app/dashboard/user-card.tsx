'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { client, signOut, useSession } from '@/lib/auth/client';
import { type Session } from '@/lib/auth/types';
import { MobileIcon } from '@radix-ui/react-icons';
import { Edit, Laptop, Loader2, LogOut, Shield, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { UAParser } from 'ua-parser-js';

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [signOutDevices, setSignOutDevices] = useState<boolean>(false);
  return (
    <Dialog
      onOpenChange={setOpen}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          className="gap-2 z-10"
          size="sm"
          variant="outline"
        >
          <svg
            height="1em"
            viewBox="0 0 24 24"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 18.5v-1h19v1zm.535-5.973l-.762-.442l.965-1.693h-1.93v-.884h1.93l-.965-1.642l.762-.443L4 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L4 10.835zm8 0l-.762-.442l.966-1.693H9.308v-.884h1.93l-.965-1.642l.762-.443L12 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L12 10.835zm8 0l-.762-.442l.966-1.693h-1.931v-.884h1.93l-.965-1.642l.762-.443L20 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L20 10.835z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm text-muted-foreground">Change Password</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Change your password</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="current-password">Current Password</Label>
          <PasswordInput
            autoComplete="new-password"
            id="current-password"
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Password"
            value={currentPassword}
          />
          <Label htmlFor="new-password">New Password</Label>
          <PasswordInput
            autoComplete="new-password"
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New Password"
            value={newPassword}
          />
          <Label htmlFor="password">Confirm Password</Label>
          <PasswordInput
            autoComplete="new-password"
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm Password"
            value={confirmPassword}
          />
          <div className="flex gap-2 items-center">
            <Checkbox
              onCheckedChange={(checked) =>
                checked ? setSignOutDevices(true) : setSignOutDevices(false)
              }
            />
            <p className="text-sm">Sign out from other devices</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              if (newPassword !== confirmPassword) {
                toast.error('Passwords do not match');
                return;
              }

              if (newPassword.length < 8) {
                toast.error('Password must be at least 8 characters');
                return;
              }

              setLoading(true);
              const response = await client.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: signOutDevices,
              });
              setLoading(false);
              if (response.error) {
                toast.error(
                  response.error.message ||
                    "Couldn't change your password! Make sure it's correct",
                );
              } else {
                setOpen(false);
                toast.success('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }
            }}
          >
            {loading ? (
              <Loader2
                className="animate-spin"
                size={15}
              />
            ) : (
              'Change Password'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditUserDialog = () => {
  const { data } = useSession();
  const [name, setName] = useState<string>();
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<null | string>(null);
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <Dialog
      onOpenChange={setOpen}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          className="gap-2"
          size="sm"
          variant="secondary"
        >
          <Edit size={13} />
          Edit User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Edit user information</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            onChange={(event) => {
              setName(event.target.value);
            }}
            placeholder={data?.user.name}
            required
            type="name"
          />
          <div className="grid gap-2">
            <Label htmlFor="image">Profile Image</Label>
            <div className="flex items-end gap-4">
              {imagePreview && (
                <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                  <Image
                    alt="Profile preview"
                    layout="fill"
                    objectFit="cover"
                    src={imagePreview}
                  />
                </div>
              )}
              <div className="flex items-center gap-2 w-full">
                <Input
                  accept="image/*"
                  className="w-full text-muted-foreground"
                  id="image"
                  onChange={handleImageChange}
                  type="file"
                />
                {imagePreview && (
                  <X
                    className="cursor-pointer"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              await client.updateUser({
                fetchOptions: {
                  onError: (updateError) => {
                    toast.error(updateError.error.message);
                  },
                  onSuccess: () => {
                    toast.success('User updated successfully');
                  },
                },
                image: image ? await convertImageToBase64(image) : undefined,
                name: name ? name : undefined,
              });
              setName('');
              router.refresh();
              setImage(null);
              setImagePreview(null);
              setIsLoading(false);
              setOpen(false);
            }}
          >
            {isLoading ? (
              <Loader2
                className="animate-spin"
                size={15}
              />
            ) : (
              'Update'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function UserCard(props: {
  readonly activeSessions: Array<Session['session']>;
  readonly session: null | Session;
}) {
  const router = useRouter();
  const { data } = useSession();
  const session = data || props.session;
  const [isTerminating, setIsTerminating] = useState<string>();
  const [isSignOut, setIsSignOut] = useState<boolean>(false);
  const [emailVerificationPending, setEmailVerificationPending] =
    useState<boolean>(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>User</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 grid-cols-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex ">
              <AvatarImage
                alt="Avatar"
                className="object-cover"
                src={session?.user.image || '#'}
              />
              <AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {session?.user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {session?.user.email}
              </p>
            </div>
          </div>
          <EditUserDialog />
        </div>

        {/* User Role Display */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
          {session?.user.role === 'admin' ? (
            <Shield className="h-5 w-5 text-primary" />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">Account Role</p>
            <p className="text-xs text-muted-foreground">
              {session?.user.role === 'admin'
                ? 'You have full admin access to manage courses and users.'
                : 'Standard user account for purchasing and viewing courses.'}
            </p>
          </div>
          <Badge
            variant={session?.user.role === 'admin' ? 'default' : 'secondary'}
          >
            {session?.user.role || 'user'}
          </Badge>
        </div>

        {session?.user.emailVerified ? null : (
          <Alert>
            <AlertTitle>Verify Your Email Address</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Please verify your email address. Check your inbox for the
              verification email. If you haven&apos;t received the email, click
              the button below to resend.
            </AlertDescription>
            <Button
              className="mt-2"
              onClick={async () => {
                await client.sendVerificationEmail(
                  {
                    email: session?.user.email || '',
                  },
                  {
                    onError(context) {
                      toast.error(context.error.message);
                      setEmailVerificationPending(false);
                    },
                    onRequest() {
                      setEmailVerificationPending(true);
                    },
                    onSuccess() {
                      toast.success('Verification email sent successfully');
                      setEmailVerificationPending(false);
                    },
                  },
                );
              }}
              size="sm"
              variant="secondary"
            >
              {emailVerificationPending ? (
                <Loader2
                  className="animate-spin"
                  size={15}
                />
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          </Alert>
        )}

        <div className="border-l-2 px-2 w-max gap-1 flex flex-col">
          <p className="text-xs font-medium ">Active Sessions</p>
          {props.activeSessions
            .filter((activeSession) => activeSession.userAgent)
            .map((activeSession) => {
              const parser = new UAParser(activeSession.userAgent || '');
              const deviceType = parser.getDevice().type;
              const osName = parser.getOS().name;
              const browserName = parser.getBrowser().name;

              return (
                <div key={activeSession.id}>
                  <div className="flex items-center gap-2 text-sm  text-black font-medium dark:text-white">
                    {deviceType === 'mobile' ? (
                      <MobileIcon />
                    ) : (
                      <Laptop size={16} />
                    )}
                    {osName}, {browserName}
                    <button
                      className="text-red-500 opacity-80  cursor-pointer text-xs border-muted-foreground border-red-600  underline "
                      onClick={async () => {
                        setIsTerminating(activeSession.id);
                        const response = await client.revokeSession({
                          token: activeSession.token,
                        });

                        if (response.error) {
                          toast.error(response.error.message);
                        } else {
                          toast.success('Session terminated successfully');
                        }

                        router.refresh();
                        setIsTerminating(undefined);
                      }}
                      type="button"
                    >
                      {isTerminating === activeSession.id ? (
                        <Loader2
                          className="animate-spin"
                          size={15}
                        />
                      ) : activeSession.id === props.session?.session.id ? (
                        'Sign Out'
                      ) : (
                        'Terminate'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
      <CardFooter className="gap-2 justify-between items-center">
        <ChangePassword />
        <Button
          className="gap-2 z-10"
          disabled={isSignOut}
          onClick={async () => {
            setIsSignOut(true);
            await signOut({
              fetchOptions: {
                onSuccess() {
                  router.push('/');
                },
              },
            });
            setIsSignOut(false);
          }}
          variant="secondary"
        >
          <span className="text-sm">
            {isSignOut ? (
              <Loader2
                className="animate-spin"
                size={15}
              />
            ) : (
              <div className="flex items-center gap-2">
                <LogOut size={16} />
                Sign Out
              </div>
            )}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
