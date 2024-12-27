//types/next-auth.d.ts

import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profile_image?: string;
      groups?: { displayName: string }[];
      access_token_expires_at?: number;
    };
    error?: string;
  }

  interface User {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    profile_image?: string;
    groups?: { displayName: string }[];
    access_token_expires_at?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profile_image?: string;
      groups?: { displayName: string }[];
      access_token_expires_at?: number;
    };
    error?: string;
  }
}