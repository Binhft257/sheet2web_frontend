import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { APP_PREFIX, appPath } from "@/src/lib/app-path";

class AccountNotVerifiedError extends CredentialsSignin {
  constructor(userId?: string) {
    super();
    this.code = userId ? `account_not_verified:${userId}` : "account_not_verified";
  }
}

type LoginErrorResponse = {
  message?: string;
  statusCode?: number;
  id?: string;
  userId?: string;
  data?: {
    id?: string;
    userId?: string;
  };
};

type LoginSuccessResponse = {
  access_token?: string;
};

function extractUserId(errorData: LoginErrorResponse | null) {
  if (!errorData) {
    return undefined;
  }

  if (errorData.id) {
    return errorData.id;
  }

  if (errorData.userId) {
    return errorData.userId;
  }

  if (errorData.data?.id) {
    return errorData.data.id;
  }

  if (errorData.data?.userId) {
    return errorData.data.userId;
  }

  return undefined;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: "/api/auth",
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      authorize: async (rawCredentials) => {
        const email = rawCredentials?.email as string | undefined;
        const password = rawCredentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        const res = await fetch(`${process.env.API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            passwordHash: password,
          }),
        });

        if (!res.ok) {
          let errorData: LoginErrorResponse | null = null;

          try {
            errorData = (await res.json()) as LoginErrorResponse;
          } catch {
            errorData = null;
          }

          if (
            errorData?.statusCode === 400 &&
            errorData.message === "Tài khoản chưa được kích hoạt"
          ) {
            throw new AccountNotVerifiedError(extractUserId(errorData));
          }

          return null;
        }

        const data = (await res.json()) as LoginSuccessResponse;
        if (!data.access_token) {
          return null;
        }

        return {
          id: email,
          email,
          name: email.split("@")[0],
          accessToken: data.access_token,
        };
      },
    }),
  ],

  callbacks: {
    redirect({ url, baseUrl }) {
      const destination = new URL(url, baseUrl);
      const appRoot = `${baseUrl}${appPath("/")}`;

      if (destination.origin !== baseUrl) {
        return appRoot;
      }

      if (APP_PREFIX) {
        if (destination.pathname === APP_PREFIX) {
          destination.pathname = `${APP_PREFIX}/`;
        } else if (!destination.pathname.startsWith(`${APP_PREFIX}/`)) {
          destination.pathname = `${APP_PREFIX}${destination.pathname}`;
        }
      }

      return destination.toString();
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.accessToken = token.accessToken as string;

      return session;
    },
  },

  pages: {
    signIn: appPath("/sign-in"),
  },
});
