import toast from "solid-toast";

export const openAndWait = (
  url: string,
  title: string,
  fn: () => Promise<void>,
  ms = 500
) => {
  const w = window.open(url, title);

  const int = setInterval(() => {
    if (w?.closed) {
      clearInterval(int);
      void fn();
    }
  }, ms);
};

export const sleep = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const _getToastMessage = (e: unknown) => {
  if (typeof e === "string") return e;
  if (e instanceof Error) {
    return e.message;
  }
  return "An error occurred";
};

export function capitalizeWords(input: string): string {
  return input
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const getToastMessage = (e: unknown) => {
  const str = _getToastMessage(e);
  return capitalizeWords(str);
};

export const wrapWithTry = async (fn: () => Promise<any>) => {
  try {
    await fn();
  } catch (e) {
    toast.error(getToastMessage(e));
  }
};

export const allowedProviders = ["google", "discord", "github"] as const;
