import { Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

export const authInclude = {
  contactInitiated: {
    include: {
      user: {
        select: { image: true, id: true, name: true },
      },
    },
  }, // Fetch contacts the user initiated
  contactReceived: {
    include: {
      user: {
        select: { image: true, id: true, name: true },
      },
    },
  }, // Fetch contacts the user received
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
    const combinedContacts = [
      ...userAndSession?.user?.contactInitiated,
      ...userAndSession?.user?.contactReceived,
    ];
    const { user, ...session } = userAndSession;
    return { user: { ...user, contacts: combinedContacts }, session };
  };

  return base as Adapter;
}
