import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(token) {
  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      refresh_token: token.refreshToken,
    });

    const res = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    if (!res.ok) return { ...token, error: "RefreshAccessTokenError" };

    const data = await res.json();
    const decoded = JSON.parse(
      Buffer.from(data.access_token.split(".")[1], "base64").toString()
    );

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      accessTokenExpires: decoded.exp * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const params = new URLSearchParams({
            grant_type: "password",
            client_id: process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
            username: credentials.username,
            password: credentials.password,
          });

          const res = await fetch(
            `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: params.toString(),
            }
          );

          if (!res.ok) return null;

          const data = await res.json();
          const decoded = JSON.parse(
            Buffer.from(data.access_token.split(".")[1], "base64").toString()
          );

          return {
            id: credentials.username,
            name: credentials.username,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            accessTokenExpires: decoded.exp * 1000,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // Token still valid (60s buffer before real expiry)
      if (Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};
