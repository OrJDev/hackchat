import type { CustomResponse } from "@solidjs/router";
import { prisma } from "./db";

export const sendError = (error: string): CustomResponse<never> => {
  return { error } as any;
};

export const isInContacts = async (currentUser: string, inputUser: string) => {
  return await prisma.contact.findFirst({
    where: {
      OR: [
        {
          userId: currentUser,
          contactUserId: inputUser,
        },
        {
          userId: inputUser,
          contactUserId: currentUser,
        },
      ],
    },
  });
};
