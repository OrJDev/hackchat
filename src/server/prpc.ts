import { createCaller, error$ } from "@solid-mediakit/prpc";
import { authOptions } from "./auth";
import { getSession } from "@solid-mediakit/auth";
import { prisma } from "./db";

export const helloCaller = createCaller
  .use(() => {
    return {
      hello: 1,
    };
  })
  .use(({ ctx$ }) => {
    return {
      ...ctx$,
      world: 2,
    };
  });

export const userCaller = createCaller.use(async ({ event$ }) => {
  const session = await getSession(event$.request, authOptions);
  if (!session) {
    return error$("Unauthorized", {
      status: 401,
    });
  }
  return { session, prisma };
});
