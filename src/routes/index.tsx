import { A } from "@solidjs/router";
import { For, VoidComponent } from "solid-js";

const Home: VoidComponent = () => {
  return (
    <main class="flex flex-col gap-2 items-center justify-center">
      <h1 class="text-2xl sm:text-3xl font-bold text-offwhite">
        Welcome To{" "}
        <span class="decoration-offwhite underline decoration-dotted text-purple-500">
          HackChat
        </span>
      </h1>
      <p class="text-white font-semibold text-sm sm:text-lg max-w-[70vw] sm:max-w-[400px] text-center">
        <strong class="text-purple-500">HackChat</strong> Is An Online Chat App
        You Can Use To Talk To Your Friends About{" "}
        <strong class="decoration-dotted under underline decoration-purple-500">
          Solid
        </strong>{" "}
        And How Awesome It Is.
      </p>
      <img
        src="/solid.svg"
        style={{
          "object-fit": "contain",
        }}
        class="h-20 w-20 sm:w-24 sm:h-24"
      />
      <span class="text-offwhite text-sm sm:text-lg font-medium text-center">
        This Project Was Created For The{" "}
        <A
          href="https://hack.solidjs.com/"
          class="underline decoration-purple-500 font-bold"
        >
          2024 SolidJS Hackathon
        </A>{" "}
        <br /> And Was Created Using The Following Technologies
      </span>
      <ul class="flex flex-col items-center">
        <For
          each={Object.entries({
            pRPC: "https://github.com/solidjs-community/mediakit/tree/main/packages/auth/solid",
            "Solid Auth":
              "https://github.com/solidjs-community/mediakit/tree/main/packages/auth/solid",
            PusherJS: "https://pusher.com",
            Prisma: "https://www.prisma.io",
          })}
        >
          {([name, link]) => (
            <li class="list-disc text-white font-bold w-[100px]">
              <A target="__blank" href={link} class="text-blue-400">
                {name}
              </A>
            </li>
          )}
        </For>
      </ul>
    </main>
  );
};

export default Home;
