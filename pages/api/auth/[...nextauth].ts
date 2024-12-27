import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import AzureADProvider from "next-auth/providers/azure-ad";
import { custom } from "openid-client";

custom.setHttpOptionsDefaults({
  timeout: 10000,
});

async function refreshAccessToken(token: JWT) {
  try {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      client_id: process.env.AZURE_AD_CLIENT_ID || "azure-ad-client-id",
      client_secret: process.env.AZURE_AD_CLIENT_SECRET || "azure-ad-client-secret",
      scope: "email openid profile User.Read offline_access Directory.Read.All GroupMember.Read.All",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "azure-ad-client-id",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "azure-ad-client-secret",
      tenantId: process.env.AZURE_AD_TENANT_ID || "azure-ad-tenant-id",
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read Directory.Read.All GroupMember.Read.All"
        },
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.JWT_SECRET || "jwt-secret",
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.id_token,
          accessTokenExpires: account?.expires_at
            ? account.expires_at * 1000
            : 0,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (
        Date.now() <
          (token as JWT & { accessTokenExpires: number }).accessTokenExpires ||
        0
      ) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      if (session) {
        // Fetch profile image
        const profileImageUrl = `https://graph.microsoft.com/v1.0/me/photo/$value`;
        const imageResponse = await fetch(profileImageUrl, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });

        let profileImageData: string | undefined = undefined;
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const reader = new FileReader();
          profileImageData = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageBlob);
          });
        }

        // Fetch user groups (raw data)
        const groupsUrl = `https://graph.microsoft.com/v1.0/me/transitiveMemberOf?$select=displayName`;
        const groupsResponse = await fetch(groupsUrl, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });
        const groupsData = await groupsResponse.json();

        // Assign retrieved data to session
        session.user = token.user;
        session.error = token.error;
        session.user.access_token_expires_at = token.accessTokenExpires;
        session.expires = token.accessTokenExpires;

        // Attach the profile image if present
        if (profileImageData) {
          session.user.profile_image = profileImageData;
        }

        // Attach the entire groupsData object for debugging purposes
        session.user.groups = groupsData;

        return session;
      }

      return session;
    },
  },
});
