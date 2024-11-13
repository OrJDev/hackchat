import { useAuth } from "@solid-mediakit/auth/client";
import { A, useLocation, useNavigate } from "@solidjs/router";
import { createMemo, createSignal, Show, VoidComponent } from "solid-js";
import { wrapWithTry } from "~/utils/helpers";
import { RenderUserImage } from "./RenderUserImage";
import { revalidateProtected } from "~/utils/user";

export const NavBar: VoidComponent = () => {
  const [signOut, setSignOut] = createSignal(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const location = useLocation();

  const isFakeNavBar = createMemo(
    () =>
      location.pathname === "/auth/github" ||
      location.pathname === "/auth/discord"
  );

  return (
    <nav class="w-full h-24 p-3 flex items-center px-12 justify-between gap-2 fixed top-0 left-0 right-0 border-b-[0.5px] border-b-gray-100/20">
      <RenderUserImage />

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
        <button
          disabled={signOut() || isFakeNavBar()}
          onClick={async () => {
            await wrapWithTry(async () => {
              setSignOut(true);
              await auth.signOut({ redirect: false });
              await revalidateProtected();
              setSignOut(false);
              navigate("/auth", { replace: true });
            });
          }}
          class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-white font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
          style={{
            "box-shadow": `0 0 0 1px #555`,
          }}
        >
          Log Out
        </button>
      </Show>
    </nav>
  );
};
