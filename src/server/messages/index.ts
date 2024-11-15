import { createCaller, error$ } from "@solid-mediakit/prpc";
import { z } from "zod";
import { isInContacts } from "../prpc";
import { prisma } from "../db";
import { trigger } from "../pusher";

export const triggerMessage = createCaller(
  z.object({
    id: z.string(),
    content: z.string().min(1),
    messageId: z.string(),
  }),
  async ({ session$, input$ }) => {
    const user = await prisma.user.findUnique({ where: { id: input$.id } });
    if (!user) {
      return error$("Can't find this user");
    }
    if (!(await isInContacts(session$.user.id, input$.id))) {
      return error$("This user is not in your contacts");
    }
    await trigger(user.id, "message_sent", {
      by: session$.user.id,
      content: input$.content,
      messageId: input$.messageId,
    });
  },
  { protected: true, type: "action" }
);
