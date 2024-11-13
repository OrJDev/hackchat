import { useAuth } from "@solid-mediakit/auth/client";
import { Show } from "solid-js";

export const RenderUserImage = () => {
  const auth = useAuth();

  const getType = () =>
    auth.session()?.user.image ? ("img" as const) : ("text" as const);

  return (
    <Show when={auth.status() === "authenticated"}>
      <div
        class={`relative w-16 h-16 rounded-full bg-gray-400 ${
          getType() === "text" ? "flex items-center justify-center" : ""
        }`}
      >
        {getType() === "img" ? (
          <img
            src={auth.session()?.user.image!}
            style={{ "object-fit": "contain" }}
            class={`absolute rounded-full inset-0`}
          />
        ) : (
          <span class="uppercase text-2xl font-bold text-offwhite">
            {auth.session()?.user.name?.slice(0, 2)}
          </span>
        )}
      </div>
    </Show>
  );
};
