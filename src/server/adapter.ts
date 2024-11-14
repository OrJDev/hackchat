import { Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

export function MyPrismaAdapter(p: PrismaClient): Adapter {
  const base = PrismaAdapter(p);
  (base as any).getSessionAndUser = async (sessionToken: string) => {
    const select = { image: true, id: true, name: true };
    const userAndSession = await p.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            contactInitiated: {
              include: {
                contactUser: {
                  select,
                },
              },
            },
            contactReceived: {
              include: {
                user: {
                  select,
                },
              },
            },
          },
        },
      },
    });
    if (!userAndSession) return null;
    const combinedContacts = [
      ...userAndSession?.user?.contactInitiated.map((e) => {
        return {
          ...e,
          user: e.contactUser,
        };
      }),
      ...userAndSession?.user?.contactReceived,
    ];
    const { user, ...session } = userAndSession;
    return { user: { ...user, contacts: combinedContacts }, session };
  };

  return base as Adapter;
}
