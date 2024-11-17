import { isServer } from "solid-js/web";

export const getUrl = () =>
  isServer ? process.env.AUTH_URL! : window.location.origin;
