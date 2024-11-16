import { getSession } from "@solid-mediakit/auth";
import { createMiddleware } from "@solidjs/start/middleware";
import { authOptions } from "./server/auth";
import { redirect } from "@solidjs/router";

const paths = {
  "/": false,
  "/dashboard": true,
  "/auth": null,
  "/contact": false,
} satisfies Record<string, boolean | null>;

export default createMiddleware({
  onRequest: async (event) => {
    const url = new URL(event.request.url);
    const cond = url.pathname.startsWith("/contact/");
    if (cond || url.pathname in paths) {
      const k = cond
        ? paths["/contact"]
        : paths[url.pathname as keyof typeof paths];
      const session =
        event.locals.session !== undefined
          ? event.locals.session
          : await getSession(event, authOptions);
      // preload all paths
      event.locals.session = session;
      if (k === null) {
        // nulls mean signed in users aren't allowed
        if (session) {
          return redirect("/dashboard");
        }
      } else if (k === true) {
        // true means only signed in users allowed
        if (!session) {
          return redirect(`/auth?r=${encodeURIComponent(url.pathname)}`);
        }
      }
    }
  },
});
