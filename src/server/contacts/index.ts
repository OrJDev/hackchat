import { createCaller, error$ } from "@solid-mediakit/prpc";
import { z } from "zod";
import { prisma } from "~/server/db";
import { isInContacts } from "../prpc";
import { trigger } from "../pusher";

export const getContactLink = createCaller(
  z.object({ id: z.string() }),
  async ({ input$, session$ }) => {
    if (input$.id === session$?.user.id) {
      return error$("You can't accept your own requests");
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
      return error$("No Such Invitation Link");
    }
    return user;
  }
);

export const acceptContact = createCaller(
  z.object({ id: z.string() }),
  async ({ session$, input$ }) => {
    if (input$.id === session$.user.id) {
      return error$("Sadly, you can't accept your own requests");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: input$.id,
      },
    });
    if (!user) {
      return error$("No Such Invitation Link");
    }
    if (await isInContacts(session$.user.id, user.id)) {
      return error$("This user is already in your contacts");
    }
    await prisma.contact.create({
      data: {
        userId: user.id,
        contactUserId: session$.user.id,
      },
    });
    await trigger(user.id, "contact_added", {
      name: session$.user.name,
      img: session$.user.image,
      id: session$.user.id,
      online: true,
    });

    return true;
  },
  { protected: true, type: "action" }
);
