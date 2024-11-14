import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
  Show,
  startTransition,
  VoidComponent,
} from "solid-js";
import { AiFillGithub } from "solid-icons/ai";
import { FaBrandsDiscord, FaBrandsGoogle } from "solid-icons/fa";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { capitalize } from "~/utils/string";
import { useAuth } from "@solid-mediakit/auth/client";
import { allowedProviders, openAndWait, wrapWithTry } from "~/utils/helpers";
import toast from "solid-toast";
import { LoadingIndicator } from "~/components";
import { Title } from "@solidjs/meta";

type AllowedStatus = "initial" | "pending" | "success";

const Auth: VoidComponent = () => {
  const [status, setStatus] = createSignal<AllowedStatus>("initial");
  const [searchParams] = useSearchParams();

  const r = () =>
    searchParams.r && typeof searchParams.r === "string"
      ? searchParams.r
      : undefined;

  return (
    <>
      <Title>HackChat - Login</Title>
      <div class="flex flex-col gap-4 items-center h-full w-full">
        <h1 class="text-3xl font-bold text-offwhite">
          Log In To{" "}
          <span class="decoration-offwhite underline decoration-dotted text-purple-500">
            HackChat
          </span>
        </h1>
        <div class="flex flex-col gap-3 w-[300px] items-center">
          <For each={allowedProviders}>
            {(provider) => (
              <SignInMethod
                r={r}
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
    </>
  );
};

export default Auth;

const SignInMethod: Component<{
  r: Accessor<string | null | undefined>;
  name: (typeof allowedProviders)[number];
  onStatusUpdate: (newStatus: AllowedStatus) => void;
  disabled: Accessor<boolean>;
}> = (props) => {
  const [status, setStatus] = createSignal<AllowedStatus>("initial");
  const auth = useAuth();
  const navigate = useNavigate();

  const disabled = createMemo(() => {
    if (props.disabled()) return true;
    return status() === "success";
  });

  let r = false;

  createEffect(
    on(status, (s) => {
      if (!r && s === "initial") {
        r = true;
      } else {
        props.onStatusUpdate(s);
      }
    })
  );

  return (
    <button
      disabled={disabled()}
      style={{
        "box-shadow": `0 0 0 1px ${
          props.name === "github"
            ? "#24292e"
            : props.name === "google"
            ? "#DB4437"
            : "#5865F2"
        }`,
      }}
      class={`flex gap-2 items-center w-full justify-center transition-all select-none ${
        props.name === "github"
          ? `${
              disabled()
                ? "bg-[#24292e]/40"
                : "hover:bg-[#555] hover:shadow-[#555] bg-[#24292e]"
            }`
          : props.name === "google"
          ? `${
              disabled()
                ? "bg-[#DB4437]/40"
                : "hover:shadow-[#DB4437]/50 hover:bg-[#DB4437]/30 bg-[#DB4437]/70"
            }`
          : `${
              disabled()
                ? "bg-[#5865F2]/40"
                : "hover:shadow-[#5865F2] hover:bg-opacity-80 bg-[#5865F2]"
            } `
      } text-white px-[14px] h-12 rounded-lg font-medium`}
      onClick={async () => {
        setStatus("pending");
        await wrapWithTry(async () =>
          openAndWait(
            `${window.location.origin}/auth/${props.name}`,
            `Sign In With ${capitalize(props.name)}`,
            async () => {
              startTransition(async () => {
                const newSession = await auth.refetch(true);
                if (newSession.status === "authenticated") {
                  setStatus("success");
                  toast.success(`Welcome ${newSession.data.user.name}`);
                  navigate(props.r() ?? "/dashboard");
                } else {
                  toast.error("Couldn't Sign You In");
                  setStatus("initial");
                }
              });
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
      ) : props.name === "google" ? (
        <FaBrandsGoogle size={25} />
      ) : (
        <FaBrandsDiscord size={25} />
      )}
      Continue With {capitalize(props.name)}
    </button>
  );
};
