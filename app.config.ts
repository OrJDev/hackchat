import { withPRPC } from "@solid-mediakit/prpc-plugin";
// @ts-expect-error
import { vitePlugin as OGPlugin } from "@solid-mediakit/og/unplugin";

const config = withPRPC(
  {
    ssr: true,
    middleware: "./src/middleware.ts",
    vite: {
      ssr: {
        external: ["@prisma/client"],
      },
      optimizeDeps: {
        exclude: ["solid-icons"],
      },
      plugins: [OGPlugin()],
    },
    server: {
      preset: "vercel",
    },
  },
  {
    auth: "authjs",
    authCfg: {
      configName: "authOptions",
      source: "~/server/auth",
    },
  }
);

export default config;

declare module "@solid-mediakit/prpc" {
  interface Settings {
    config: typeof config;
  }
}
