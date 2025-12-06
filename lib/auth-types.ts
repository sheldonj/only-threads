import { type auth } from './auth';
import { type client } from './auth-client';

export type ActiveOrganization = typeof client.$Infer.ActiveOrganization;
export type Invitation = typeof client.$Infer.Invitation;
export type Session = typeof auth.$Infer.Session;
