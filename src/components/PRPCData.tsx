import type { PRPClientError } from "@solid-mediakit/prpc";
import { A } from "@solidjs/router";
import { ParentComponent, Show, type JSXElement } from "solid-js";

export const RenderPRPCData = <T extends object>(props: {
  data: T | undefined | { error: string };
  error?: PRPClientError<any> | null;
  children: JSXElement;
}) => {
  return (
    <Show
      when={props.data && (props.error || "error" in props.data)}
      fallback={<RenderChildren children={props.children} />}
    >
      <>
        <div class="font-bold text-red-500 text-xl bg-zinc-900 rounded-lg p-3 flex items-center justify-center my-12">
          <p>
            {props.data && "error" in props.data
              ? props.data.error
              : props.error?.message
              ? props.error.message
              : "Something Went Wrong"}
          </p>
        </div>
        <A
          href="/dashboard"
          class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-red-500 font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
          style={{
            "box-shadow": `0 0 0 1px #555`,
          }}
        >
          Go Home
        </A>
      </>
    </Show>
  );
};

const RenderChildren: ParentComponent = (props) => props.children;
