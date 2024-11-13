import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
  Show,
  VoidComponent,
} from "solid-js";
import { AiFillGithub } from "solid-icons/ai";
import { FaBrandsDiscord } from "solid-icons/fa";
import { useNavigate } from "@solidjs/router";
import { capitalize } from "~/utils/string";
import { useAuth } from "@solid-mediakit/auth/client";
import { openAndWait, wrapWithTry } from "~/utils/helpers";
import toast from "solid-toast";
import { LoadingIndicator } from "~/components";

type AllowedStatus = "initial" | "pending" | "success";

const Auth: VoidComponent = () => {
  const [status, setStatus] = createSignal<AllowedStatus>("initial");
  return (
    <div class="flex flex-col gap-4 items-center h-full w-full">
      <h1 class="text-3xl font-bold text-offwhite">
        Log In To{" "}
        <span class="decoration-offwhite underline decoration-dotted text-purple-500">
          HackChat
        </span>
      </h1>
      <div class="flex flex-col gap-3 w-[300px] items-center">
        <For each={["github", "discord"] as const}>
          {(provider) => (
            <SignInMethod
              name={provider}
              disabled={() => status() !== "initial"}
              onStatusUpdate={(newStatus) => setStatus(newStatus)}
            />
          )}
        </For>

        <div class="my-3 w-[80%] rounded-lg bg-gray-200 h-[0.5px]" />
        <p class="text-gray-300 font-semibold text-sm w-full text-center">
          For privacy of the users, you are required to Sign In before sending
          any messages.
        </p>
      </div>
    </div>
  );
};

export default Auth;

const SignInMethod: Component<{
  name: "github" | "discord";
  onStatusUpdate: (newStatus: AllowedStatus) => void;
  disabled: Accessor<boolean>;
}> = (props) => {
  const [status, setStatus] = createSignal<AllowedStatus>("initial");
  const auth = useAuth();
  const navigate = useNavigate();

  createEffect(
    on(status, (s) => {
      if (s !== "initial") {
        props.onStatusUpdate(s);
      }
    })
  );

  const disabled = createMemo(() => {
    if (props.disabled()) return true;
    return status() === "success";
  });

  return (
    <button
      disabled={disabled()}
      style={{
        "box-shadow": `0 0 0 1px ${
          props.name === "github" ? "#24292e" : "#5865F2"
        }`,
      }}
      class={`flex gap-2 items-center w-full justify-center transition-all select-none ${
        props.name === "github"
          ? "bg-[#24292e] hover:bg-[#555] hover:shadow-[#555]"
          : "hover:shadow-[#5865F2] bg-[#5865F2] hover:bg-opacity-80 "
      } text-white px-[14px] h-12 rounded-lg font-medium`}
      onClick={async () => {
        setStatus("pending");
        await wrapWithTry(
          async () =>
            await openAndWait(
              `${window.location.origin}/auth/${props.name}`,
              `Sign In With ${capitalize(props.name)}`,
              async () => {
                const newSession = await auth.refetch(true);
                if (newSession.status === "authenticated") {
                  setStatus("success");
                  toast.success(`Welcome ${newSession.data.user.name}`);
                  navigate("/dashboard");
                } else {
                  toast.error("Couldn't Sign You In");
                  setStatus("initial");
                }
              }
            )
        );
      }}
    >
      <Show when={status() === "pending"}>
        <LoadingIndicator white />
      </Show>
      {props.name === "github" ? (
        <AiFillGithub size={25} />
      ) : (
        <FaBrandsDiscord size={25} />
      )}
      Continue With {capitalize(props.name)}
    </button>
  );
};
