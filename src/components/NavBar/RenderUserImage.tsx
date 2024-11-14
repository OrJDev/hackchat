import { Component } from "solid-js";

export const RenderUserImage: Component<{
  img?: string | null;
  name?: string | null;
  sm?: boolean;
  alwaysSm?: boolean;
}> = (props) => {
  const getType = () => (props.img ? ("img" as const) : ("text" as const));

  return (
    <div
      class={`relative rounded-full bg-gray-400 ${
        getType() === "text" ? "flex items-center justify-center" : ""
      } ${
        props.sm || props.alwaysSm
          ? `h-10 w-10 ${props.alwaysSm ? "" : "sm:w-16 sm:h-16"}`
          : "w-16 h-16 "
      }`}
    >
      {getType() === "img" ? (
        <img
          src={props.img as unknown as string}
          style={{ "object-fit": "contain" }}
          class={`absolute rounded-full inset-0`}
        />
      ) : (
        <span class="uppercase text-2xl font-bold text-offwhite">
          {props.name?.slice(0, 2)}
        </span>
      )}
    </div>
  );
};
