import { type auth } from './auth';
import { type client } from './auth-client';

export type ActiveOrganization = typeof client.$Infer.ActiveOrganization;
export type Session = typeof auth.$Infer.Session;
