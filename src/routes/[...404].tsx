import { onCleanup, onMount, VoidComponent } from "solid-js";
import lottie from "lottie-web";
import LottieData from "../../public/not-found.json";
import { A } from "@solidjs/router";
import { Title } from "@solidjs/meta";

const NotFound: VoidComponent = () => {
  let ref: HTMLDivElement;
  onMount(() => {
    const animation = lottie.loadAnimation({
      container: ref,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: LottieData,
    });

    onCleanup(() => {
      animation.destroy();
    });
  });

  return (
    <>
      <Title>HackChat - 404</Title>
      <main class="flex flex-col gap-2 items-center justify-center">
        <h1 class="text-2xl font-bold text-offwhite">
          <strong class="decoration-dotted underline decoration-purple-500">
            Oops
          </strong>
          , Not Found
        </h1>
        <div ref={(r) => (ref = r)} class="w-[300px] h-[300px]" />
        <A
          href="/"
          class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-white font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
          style={{
            "box-shadow": `0 0 0 1px #555`,
          }}
        >
          Go Home
        </A>
      </main>
    </>
  );
};

export default NotFound;
