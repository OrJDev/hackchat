import { getSession, type SolidAuthConfig } from "@solid-mediakit/auth";
import Discord from "@auth/core/providers/discord";
import Github from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { prisma } from "./db";
import { serverEnv } from "~/env/server";
import { MyPrismaAdapter } from "./adapter";
import { Contact } from "@prisma/client";
import { APIEvent } from "@solidjs/start/server";

declare module "@auth/core/types" {
  export interface Session {
    user: {
      id: string;
      contacts: (Contact & {
        user: {
          id: string;
          name: string | null;
          image: string | null;
        };
      })[];
    } & DefaultSession["user"];
  }
}

export const authOptions: SolidAuthConfig = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  adapter: MyPrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: serverEnv.DISCORD_ID,
      clientSecret: serverEnv.DISCORD_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Github({
      clientId: serverEnv.GITHUB_ID,
      clientSecret: serverEnv.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: serverEnv.GOOGLE_ID,
      clientSecret: serverEnv.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  debug: false,
  basePath: import.meta.env.VITE_AUTH_PATH,
};

export const getServerSession = async (event: APIEvent) => {
  if (event.locals.session !== undefined) return event.locals.session;
  return await getSession(event, authOptions);
};
