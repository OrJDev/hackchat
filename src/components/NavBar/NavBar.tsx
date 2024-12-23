import { useAuth } from "@solid-mediakit/auth/client";
import { A, useLocation } from "@solidjs/router";
import { createMemo, createSignal, Show, VoidComponent } from "solid-js";
import { wrapWithTry } from "~/utils/helpers";
import { RenderUserImage } from "./RenderUserImage";

export const NavBar: VoidComponent = () => {
  const [signOut, setSignOut] = createSignal(false);
  const auth = useAuth();
  const location = useLocation();

  const isFakeNavBar = createMemo(
    () =>
      location.pathname === "/auth/github" ||
      location.pathname === "/auth/discord" ||
      location.pathname === "/auth/google"
  );

  return (
    <nav class="w-full bg-[#000] z-[999] h-24 p-3 flex items-center px-3 sm:px-12 justify-between gap-2 fixed top-0 left-0 right-0 border-b-[0.5px] border-b-gray-100/20">
      <Show
        when={auth.status() === "authenticated"}
        fallback={
          <A
            aria-disabled={`${isFakeNavBar()}`}
            href="/auth"
            class={`${
              isFakeNavBar() ? "animate-pulse" : ""
            } hover:bg-zinc-700 disabled:bg-opacity-50 text-white font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center`}
            style={{
              "box-shadow": `0 0 0 1px #555`,
            }}
            onClick={(e) => (isFakeNavBar() ? e.preventDefault() : void 0)}
          >
            Login
          </A>
        }
      >
        <RenderUserImage
          img={auth.session()?.user.image}
          name={auth.session()?.user.name}
        />
        <div class="flex gap-2 items-center">
          <A
            href="/dashboard"
            class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-white font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
            style={{
              "box-shadow": `0 0 0 1px #555`,
            }}
          >
            Dashboard
          </A>
          <button
            disabled={signOut() || isFakeNavBar()}
            onClick={async () => {
              await wrapWithTry(async () => {
                setSignOut(true);
                await auth.signOut({ redirect: true, redirectTo: "/auth" });
              });
            }}
            class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-white font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
            style={{
              "box-shadow": `0 0 0 1px #555`,
            }}
          >
            Log Out
          </button>
        </div>
      </Show>
    </nav>
  );
};
