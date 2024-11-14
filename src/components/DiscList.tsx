import { A } from "@solidjs/router";
import { Component, For } from "solid-js";

export const Disclist: Component<{
  data: Record<string, string | null>;
  ul?: boolean;
}> = (props) => {
  return (
    <ul
      class={`flex flex-col items-center ${
        props.ul ? "justify-center self-center justiyf-self-center w-full" : ""
      }`}
    >
      <For each={Object.entries(props.data)}>
        {([name, link]) => (
          <li
            class={`list-disc text-white font-bold ${
              props.ul ? "w-[400px] text-sm" : "w-[100px]"
            }`}
          >
            {link ? (
              <A target="__blank" href={link} class="text-blue-400">
                {name}
              </A>
            ) : (
              <span class="text-white font-bold">{name}</span>
            )}
          </li>
        )}
      </For>
    </ul>
  );
};
