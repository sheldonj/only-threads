'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CopyButton from '@/components/ui/copy-button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  organization,
  useListOrganizations,
  useSession,
} from '@/lib/auth-client';
import { type ActiveOrganization, type Session } from '@/lib/auth-types';
import { ChevronDownIcon, PlusIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MailPlus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const OrganizationCard = (props: {
  readonly activeOrganization: ActiveOrganization | null;
  readonly session: null | Session;
}) => {
  const organizations = useListOrganizations();
  const [optimisticOrg, setOptimisticOrg] = useState<ActiveOrganization | null>(
    props.activeOrganization,
  );
  const [isRevoking, setIsRevoking] = useState<string[]>([]);
  const inviteVariants = {
    exit: { height: 0, opacity: 0 },
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1 },
  };

  const { data } = useSession();
  const session = data || props.session;

  const currentMember = optimisticOrg?.members?.find(
    (member) => member.userId === session?.user.id,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <div className="flex justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-1 cursor-pointer">
                <p className="text-sm">
                  <span className="font-bold" />{' '}
                  {optimisticOrg?.name || 'Personal'}
                </p>

                <ChevronDownIcon />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                className=" py-1"
                onClick={async () => {
                  organization.setActive({
                    organizationId: null,
                  });
                  setOptimisticOrg(null);
                }}
              >
                <p className="text-sm sm">Personal</p>
              </DropdownMenuItem>
              {organizations.data?.map((org) => (
                <DropdownMenuItem
                  className=" py-1"
                  key={org.id}
                  onClick={async () => {
                    if (org.id === optimisticOrg?.id) {
                      return;
                    }

                    setOptimisticOrg({
                      invitations: [],
                      members: [],
                      ...org,
                    });
                    const { data } = await organization.setActive({
                      organizationId: org.id,
                    });
                    console.log('Set active org', data);
                    setOptimisticOrg(data);
                  }}
                >
                  <p className="text-sm sm">{org.name}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div>
            <CreateOrganizationDialog />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="rounded-none">
            <AvatarImage
              className="object-cover w-full h-full rounded-none"
              src={optimisticOrg?.logo || ''}
            />
            <AvatarFallback className="rounded-none">
              {optimisticOrg?.name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p>{optimisticOrg?.name || 'Personal'}</p>
            <p className="text-xs text-muted-foreground">
              {optimisticOrg?.members?.length || 1} members
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-8 flex-col md:flex-row">
          <div className="flex flex-col gap-2 flex-grow">
            <p className="font-medium border-b-2 border-b-foreground/10">
              Members
            </p>
            <div className="flex flex-col gap-2">
              {optimisticOrg?.members?.map((member) => (
                <div
                  className="flex justify-between items-center"
                  key={member.id}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="sm:flex w-9 h-9">
                      <AvatarImage
                        className="object-cover"
                        src={member.user.image || ''}
                      />
                      <AvatarFallback>
                        {member.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  {member.role !== 'owner' &&
                    (currentMember?.role === 'owner' ||
                      currentMember?.role === 'admin') && (
                      <Button
                        onClick={() => {
                        organization.removeMember({
                          memberIdOrEmail: member.id,
                        });
                      }}
                      size="sm"
                      variant="destructive"
                      >
                        {currentMember?.id === member.id ? 'Leave' : 'Remove'}
                      </Button>
                    )}
                </div>
              ))}
              {!optimisticOrg?.id && (
                <div>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={session?.user.image || ''} />
                      <AvatarFallback>
                        {session?.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{session?.user.name}</p>
                      <p className="text-xs text-muted-foreground">Owner</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-grow">
            <p className="font-medium border-b-2 border-b-foreground/10">
              Invites
            </p>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {optimisticOrg?.invitations
                  ?.filter((invitation) => invitation.status === 'pending')
                  .map((invitation) => (
                    <motion.div
                      animate="visible"
                      className="flex items-center justify-between"
                      exit="exit"
                      initial="hidden"
                      key={invitation.id}
                      layout
                      variants={inviteVariants}
                    >
                      <div>
                        <p className="text-sm">{invitation.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {invitation.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          disabled={isRevoking.includes(invitation.id)}
                          onClick={() => {
                            organization.cancelInvitation(
                              {
                                invitationId: invitation.id,
                              },
                              {
                                onError: (context) => {
                                  toast.error(context.error.message);
                                  setIsRevoking(
                                    isRevoking.filter(
                                      (id) => id !== invitation.id,
                                    ),
                                  );
                                },
                                onRequest: () => {
                                  setIsRevoking([...isRevoking, invitation.id]);
                                },
                                onSuccess: () => {
                                  toast.message(
                                    'Invitation revoked successfully',
                                  );
                                  setIsRevoking(
                                    isRevoking.filter(
                                      (id) => id !== invitation.id,
                                    ),
                                  );
                                  setOptimisticOrg({
                                    ...optimisticOrg,
                                    invitations:
                                      optimisticOrg?.invitations?.filter(
                                        (inv) => inv.id !== invitation.id,
                                      ),
                                  });
                                },
                              },
                            );
                          }}
                          size="sm"
                          variant="destructive"
                        >
                          {isRevoking.includes(invitation.id) ? (
                            <Loader2
                              className="animate-spin"
                              size={16}
                            />
                          ) : (
                            'Revoke'
                          )}
                        </Button>
                        <div>
                          <CopyButton
                            textToCopy={`${window.location.origin}/accept-invitation/${invitation.id}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
              {optimisticOrg?.invitations?.length === 0 && (
                <motion.p
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                >
                  No Active Invitations
                </motion.p>
              )}
              {!optimisticOrg?.id && (
                <Label className="text-xs text-muted-foreground">
                  You can&apos;t invite members to your personal workspace.
                </Label>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end w-full mt-4">
          <div>
            <div>
              {optimisticOrg?.id && (
                <InviteMemberDialog
                  optimisticOrg={optimisticOrg}
                  setOptimisticOrg={setOptimisticOrg}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CreateOrganizationDialog = () => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [logo, setLogo] = useState<null | string>(null);

  useEffect(() => {
    if (!isSlugEdited) {
      const generatedSlug = name.trim().toLowerCase().replaceAll(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  }, [isSlugEdited, name]);

  useEffect(() => {
    if (open) {
      setName('');
      setSlug('');
      setIsSlugEdited(false);
      setLogo(null);
    }
  }, [open]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog
      onOpenChange={setOpen}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          className="w-full gap-2"
          size="sm"
          variant="default"
        >
          <PlusIcon />
          <p>New Organization</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Organization Name</Label>
            <Input
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              value={name}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Organization Slug</Label>
            <Input
              onChange={(event) => {
                setSlug(event.target.value);
                setIsSlugEdited(true);
              }}
              placeholder="Slug"
              value={slug}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Logo</Label>
            <Input
              accept="image/*"
              onChange={handleLogoChange}
              type="file"
            />
            {logo && (
              <div className="mt-2">
                <Image
                  alt="Logo preview"
                  className="w-16 h-16 object-cover"
                  height={16}
                  src={logo}
                  width={16}
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await organization.create(
                {
                  logo: logo || undefined,
                  name,
                  slug,
                },
                {
                  onError: (error) => {
                    toast.error(error.error.message);
                    setLoading(false);
                  },
                  onResponse: () => {
                    setLoading(false);
                  },
                  onSuccess: () => {
                    toast.success('Organization created successfully');
                    setOpen(false);
                  },
                },
              );
            }}
          >
            {loading ? (
              <Loader2
                className="animate-spin"
                size={16}
              />
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InviteMemberDialog = ({
  optimisticOrg,
  setOptimisticOrg,
}: {
  readonly optimisticOrg: ActiveOrganization | null;
  readonly setOptimisticOrg: (org: ActiveOrganization | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-full gap-2"
          size="sm"
          variant="secondary"
        >
          <MailPlus size={16} />
          <p>Invite Member</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite a member to your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            value={email}
          />
          <Label>Role</Label>
          <Select
            onValueChange={setRole}
            value={role}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button
              disabled={loading}
              onClick={async () => {
                const invite = organization.inviteMember({
                  email,
                  fetchOptions: {
                    onSuccess: (context) => {
                      if (optimisticOrg) {
                        setOptimisticOrg({
                          ...optimisticOrg,
                          invitations: [
                            ...(optimisticOrg?.invitations || []),
                            context.data,
                          ],
                        });
                      }
                    },
                    throw: true,
                  },
                  role: role as 'member',
                });
                toast.promise(invite, {
                  error: (error) => error.error.message,
                  loading: 'Inviting member...',
                  success: 'Member invited successfully',
                });
              }}
            >
              Invite
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
