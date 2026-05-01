import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    accessToken: string;
  }

  interface Session extends DefaultSession {
    accessToken?: string;
    user: DefaultSession['user'] & {
      id: string;
    };
  }

  interface JWT {
    id?: string;
    accessToken?: string;
  }
}

export {};
