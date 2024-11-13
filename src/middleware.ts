import { getSession } from "@solid-mediakit/auth";
import { createMiddleware } from "@solidjs/start/middleware";
import { authOptions } from "./server/auth";
import { redirect } from "@solidjs/router";

const pathsToPreload = [
  "/",
  "/auth",
  "/auth/github",
  "/auth/discord",
  "/dashboard",
];

export default createMiddleware({
  onRequest: async (event) => {
    const url = new URL(event.request.url);
    if (pathsToPreload.includes(url.pathname)) {
      const session = await getSession(event, authOptions);
      event.locals.session = session;

      if (url.pathname.startsWith("/auth")) {
        if (session) {
          return redirect("/dashboard");
        }
      } else {
        if (!session) {
          return redirect("/auth");
        }
      }
    }
  },
});
