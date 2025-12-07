import { type client } from './client';
import { type auth } from './server';

export type ActiveOrganization = typeof client.$Infer.ActiveOrganization;
export type Session = typeof auth.$Infer.Session;
