import { A } from "@solidjs/router";
import { Component, VoidComponent } from "solid-js";
import { Disclist } from "~/components";

const Home: VoidComponent = () => {
  return (
    <main class="flex flex-col gap-2 items-center justify-center pb-24">
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
      <Disclist
        data={{
          pRPC: "https://github.com/solidjs-community/mediakit/tree/main/packages/auth/solid",
          "Solid Auth":
            "https://github.com/solidjs-community/mediakit/tree/main/packages/auth/solid",
          PusherJS: "https://pusher.com",
          Prisma: "https://www.prisma.io",
        }}
      />
      <RenderSection
        title="Realtime Presence"
        source="https://utfs.io/f/MUxXX3HTLdRjfAcjgsL09M6ZNokdQuEFvbGjzLhUqexBWg5i"
        description="For privacy, you can only talk to people when they are online."
      />
      <RenderSection
        title="Message Request"
        source="https://utfs.io/f/MUxXX3HTLdRjgiO1jR8VPXWpsUMAxmaJ6z4lB9b20H7rYtI3"
        description="You can only talk to people who added you via your link."
      />
      <div class="flex flex-col gap-2 items-center">
        <h1 class="font-bold text-offwhite text-xl sm:text-2xl underline decoration-dotted decoration-purple-500">
          What are you waiting for
        </h1>
        <p class="text-gray-400 font-semibold text-xs sm:text-sm">
          Get Started Now By Signing In Via Google, Discord Or Github
        </p>
        <A
          href="/auth"
          class="disabled:animate-pulse  hover:bg-zinc-700 disabled:bg-opacity-50 text-white font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
          style={{
            "box-shadow": `0 0 0 1px #555`,
          }}
        >
          Login
        </A>
      </div>
    </main>
  );
};

export default Home;

const RenderSection: Component<{
  title: string;
  source: string;
  description?: string;
}> = (props) => {
  return (
    <div class="flex flex-col gap-2 items-center py-12">
      <h1 class="font-bold text-offwhite text-xl sm:text-2xl underline decoration-dotted decoration-purple-500">
        {props.title}
      </h1>
      {props.description ? (
        <p class="text-gray-400 text-xs sm:text-sm font-semibold">
          {props.description}
        </p>
      ) : null}
      <video
        autoplay
        loop
        muted
        playsinline
        class="w-[80vw] sm:w-[60vw] rounded-lg border border-purple-300 shadow-[10px_10px_20px_rgba(128,0,128,0.5)]"
      >
        <source src={props.source} type="video/mp4" />
        <p class="text-xl font-bold text-white">
          Your browser does not support the video tag.
        </p>
      </video>
    </div>
  );
};
