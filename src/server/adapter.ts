import { Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

export const authInclude = {
  contacts: true,
};

export function MyPrismaAdapter(p: PrismaClient): Adapter {
  const base = PrismaAdapter(p);
  (base as any).getSessionAndUser = async (sessionToken: string) => {
    const userAndSession = await p.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: authInclude,
        },
      },
    });
    if (!userAndSession) return null;
    const { user, ...session } = userAndSession;
    return { user, session };
  };

  return base as Adapter;
}
