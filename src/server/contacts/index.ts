import { createCaller, error$ } from "@solid-mediakit/prpc";
import { z } from "zod";
import { prisma } from "~/server/db";
import { sendError } from "../prpc";
import { trigger } from "../pusher";

export const getContactLink = createCaller(
  z.object({ id: z.string() }),
  async ({ input$, session$ }) => {
    if (input$.id === session$.user.id) {
      return sendError("You can't accept your own requests");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: input$.id,
      },
      select: {
        name: true,
        image: true,
        id: true,
      },
    });
    if (!user) {
      return sendError("No Such Invitation Link");
    }
    return user;
  },
  { protected: true }
);

export const acceptContact = createCaller(
  z.object({ id: z.string() }),
  async ({ session$, input$ }) => {
    if (input$.id === session$.user.id) {
      return error$("Sadly, you can't accept your own requests");
    }
    const currentUserId = session$.user.id;
    const user = await prisma.user.findUnique({
      where: {
        id: input$.id,
      },
    });
    if (!user) {
      return error$("No Such Invitation Link");
    }

    const alreadyInContacts = await prisma.contact.findFirst({
      where: {
        OR: [
          {
            userId: currentUserId,
            contactUserId: input$.id,
          },
          {
            userId: input$.id,
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
        contactUserId: input$.id,
      },
    });
    await trigger(input$.id, "contact_added", {
      name: session$.user.name,
      img: session$.user.image,
      id: session$.user.id,
    });

    return true;
  },
  { protected: true, type: "action" }
);
