import { createCaller, error$ } from "@solid-mediakit/prpc";
import { z } from "zod";
import { prisma } from "~/server/db";

export const createContactLink = createCaller(
  async ({ session$ }) => {
    const link = await prisma.contactLink.create({
      data: {
        openedById: session$.user.id,
      },
    });
    return link;
  },
  { protected: true, type: "action" }
);

export const getContactLink = createCaller(
  z.object({ id: z.string() }),
  async ({ input$ }) => {
    const link = await prisma.contactLink.findUnique({
      where: {
        id: input$.id,
        acceptedbyId: null,
      },
      include: {
        openedBy: {
          select: {
            name: true,
            image: true,
            id: true,
          },
        },
      },
    });
    if (!link) {
      return error$("No Such Contact Link");
    }
    return link;
  },
  { protected: true }
);

export const acceptContact = createCaller(
  z.object({ id: z.string() }),
  async ({ session$, input$ }) => {
    const currentUserId = session$.user.id;
    const contact = await prisma.contactLink.findUnique({
      where: {
        id: input$.id,
        acceptedbyId: null,
      },
      include: {
        acceptedby: true,
      },
    });
    if (!contact) {
      return error$("This Link Was Either Already Accapted Or Invalid");
    }
    if (contact.openedById === session$.user.id) {
      return error$("Sadly, you can't accept your own requests");
    }
    const alreadyInContacts = await prisma.contact.findFirst({
      where: {
        OR: [
          {
            userId: currentUserId,
            contactUserId: contact.openedById,
          },
          {
            userId: contact.openedById,
            contactUserId: currentUserId,
          },
        ],
      },
    });
    if (alreadyInContacts) {
      return error$("This user is already in your contacts");
    }
    await prisma.contact.create({
      data: {
        userId: currentUserId,
        contactUserId: contact.openedById,
      },
    });
    return true;
  },
  { protected: true, type: "action" }
);
export type ContactProcedure = ReturnType<typeof createContactLink>["data"];

export const clearContacts = createCaller(async () => {
  return await prisma.contact.deleteMany({});
});
