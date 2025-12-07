'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { signUp } from '@/lib/auth/client';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<null | string>(null);
  const router = useRouter();

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

  const [loading, setLoading] = useState(false);

  return (
    <Card className="z-50 rounded-md rounded-t-none max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                onChange={(event) => {
                  setFirstName(event.target.value);
                }}
                placeholder="Max"
                required
                value={firstName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                onChange={(event) => {
                  setLastName(event.target.value);
                }}
                placeholder="Robinson"
                required
                value={lastName}
              />
            </div>
          </div>
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
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              autoComplete="new-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              value={password}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Confirm Password</Label>
            <PasswordInput
              autoComplete="new-password"
              id="password_confirmation"
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              placeholder="Confirm Password"
              value={passwordConfirmation}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Profile Image (optional)</Label>
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
                  className="w-full"
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
          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              await signUp.email({
                callbackURL: '/dashboard',
                email,
                fetchOptions: {
                  onError: (context) => {
                    toast.error(context.error.message);
                  },
                  onRequest: () => {
                    setLoading(true);
                  },
                  onResponse: () => {
                    setLoading(false);
                  },
                  onSuccess: async () => {
                    router.push('/dashboard');
                  },
                },
                image: image ? await convertImageToBase64(image) : '',
                name: `${firstName} ${lastName}`,
                password,
              });
            }}
            type="submit"
          >
            {loading ? (
              <Loader2
                className="animate-spin"
                size={16}
              />
            ) : (
              'Create an account'
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
};

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
