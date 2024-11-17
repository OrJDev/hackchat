import { isServer } from "solid-js/web";

export const getUrl = () =>
  import.meta.env.VITE_SITE_URL
    ? import.meta.env.VITE_SITE_URL
    : isServer
    ? process.env.AUTH_URL!
    : window.location.origin;
