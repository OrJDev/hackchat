import { getSession } from "@solid-mediakit/auth";
import { createAsync, query, redirect, revalidate } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { authOptions } from "~/server/auth";

export const getUserAndRedirect = query(async () => {
  "use server";

  const event = getRequestEvent()!;
  console.log(event.request.url);
  const url = new URL(event.request.url);
  if (
    url.pathname === "/auth" ||
    url.pathname === "/auth/github" ||
    url.pathname === "/auth/discord"
  ) {
    if (event.locals.session) {
      throw redirect("/dashboard");
    }
    const newSession = await getSession(event, authOptions);
    event.locals.session = newSession;
    if (newSession) {
      throw redirect("/dashboard");
    }
  } else {
    if (!event.locals.session) {
      const newSession = await getSession(event, authOptions);
      event.locals.session = newSession;
      if (!newSession) {
        throw redirect("/auth");
      }
    }
  }
  return true;
}, "get-user");

export const assertProtected = () => {
  const asAsync = createAsync(() => getUserAndRedirect());
  return asAsync();
};

export const revalidateProtected = () => revalidate(getUserAndRedirect.key);
