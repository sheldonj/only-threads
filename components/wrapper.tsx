'use client';

import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { signOut, useSession } from '@/lib/auth/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuerySettingsProvider } from '@zenstackhq/tanstack-query/react';
import {
  BookOpen,
  GraduationCap,
  Library,
  LogOut,
  Receipt,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const Wrapper = (props: { readonly children: React.ReactNode }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess() {
          router.push('/');
        },
      },
    });
  };

  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="min-h-screen w-full dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex justify-center">
      <div className="absolute pointer-events-none inset-0 md:flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] hidden" />
      <div className="bg-white dark:bg-black border-b py-2 flex justify-between items-center border-border absolute z-50 w-full lg:w-8/12 px-4 md:px-1">
        <Link href="/">
          <div className="flex gap-2 cursor-pointer items-center">
            <Logo />
            <p className="dark:text-white text-black font-semibold">
              Learn Something
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          <Link href="/courses">
            <Button
              size="sm"
              variant="ghost"
            >
              <BookOpen className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Courses</span>
            </Button>
          </Link>

          {session ? (
            <>
              <Link href="/library">
                <Button
                  size="sm"
                  variant="ghost"
                >
                  <Library className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">My Library</span>
                </Button>
              </Link>

              {/* Admin Dropdown */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Shield className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Admin</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href="/admin">
                      <DropdownMenuLabel className="cursor-pointer hover:bg-accent rounded-sm">
                        Admin Panel
                      </DropdownMenuLabel>
                    </Link>
                    <DropdownMenuSeparator />
                    <Link href="/admin/courses">
                      <DropdownMenuItem>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Course Management
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/admin/users">
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        User Management
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      {isAdmin && (
                        <Badge
                          className="text-xs"
                          variant="secondary"
                        >
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/library">
                    <DropdownMenuItem>
                      <Library className="h-4 w-4 mr-2" />
                      My Courses
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/purchases">
                    <DropdownMenuItem>
                      <Receipt className="h-4 w-4 mr-2" />
                      My Purchases
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard">
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/sign-in">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
      <div className="mt-20 lg:w-8/12 w-full px-4 lg:px-0">
        {props.children}
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

export const WrapperWithQuery = (props: {
  readonly children: React.ReactNode;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <QuerySettingsProvider value={{ endpoint: '/api/model' }}>
        {props.children}
      </QuerySettingsProvider>
    </QueryClientProvider>
  );
};
