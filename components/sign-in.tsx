'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { signIn } from '@/lib/auth/client';
import { Loader2, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const TEST_USERS = [
  {
    email: 'user@test.com',
    icon: User,
    label: 'User',
    password: 'password123',
  },
  {
    email: 'admin@test.com',
    icon: ShieldCheck,
    label: 'Admin',
    password: 'password123',
  },
];

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';

  const fillTestUser = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <Card className="z-50 rounded-md rounded-t-none max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
        {isDev && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Quick fill:</span>
            {TEST_USERS.map((user) => (
              <button
                className="group flex flex-col items-center gap-1"
                key={user.email}
                onClick={() => fillTestUser(user.email, user.password)}
                title={`Fill with ${user.label} credentials`}
                type="button"
              >
                <Avatar className="h-8 w-8 cursor-pointer transition-all group-hover:ring-2 group-hover:ring-primary">
                  <AvatarFallback className="bg-muted">
                    <user.icon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                  {user.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              placeholder="m@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                className="ml-auto inline-block text-sm underline"
                href="/forget-password"
              >
                Forgot your password?
              </Link>
            </div>
            <PasswordInput
              autoComplete="password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              value={password}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              onClick={() => {
                setRememberMe(!rememberMe);
              }}
            />
            <Label>Remember me</Label>
          </div>

          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              await signIn.email(
                {
                  callbackURL: callbackUrl,
                  email,
                  password,
                  rememberMe,
                },
                {
                  onError: (context) => {
                    toast.error(context.error.message);
                  },
                  onRequest: () => {
                    setLoading(true);
                  },
                  onResponse: () => {
                    setLoading(false);
                  },
                },
              );
            }}
            type="submit"
          >
            {loading ? (
              <Loader2
                className="animate-spin"
                size={16}
              />
            ) : (
              'Login'
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full border-t py-4">
          <p className="text-center text-xs text-neutral-500">
            Secured by <span className="text-orange-400">better-auth.</span>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
