// @ts-expect-error no typing
import { createOpenGraphImage } from "@solid-mediakit/og/server";
import { getUrl } from "~/utils/url";

const innerImg = (...args: any[]) => {
  "use server";

  const [r0, r1, r2, r3, r4, r5, r6, r7, r8] = args;
  return createOpenGraphImage(
    <div style={r0}>
      <img referrerpolicy="no-referrer" src={r1} srcset={r2} style={r3} />
      <div style={r4}>
        <h1 style={r5}>Add</h1>
        <span style={r6}>{r7}</span>
      </div>
      <span style={r8}>On HackChat</span>
    </div>
  );
};

export const getContactOgURL = (link: {
  name?: string | null;
  image?: string | null;
}) => {
  if (!link || !link.name || !link.image) {
    return "https://hackchat.dev/og.png";
  }
  const props = {
    values: [
      {
        height: "100%",
        width: "100%",
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "background-color": "#000",
        "font-size": "32",
      },
      link?.image,
      link?.image,
      {
        height: "150",
        width: "150",
        "border-radius": "150",
        "margin-top": "20",
      },
      {
        display: "flex",
        "flex-direction": "row",
        width: "100%",
        gap: "8",
        "margin-top": "",
        "align-items": "center",
        "justify-content": "center",
        "font-weight": "bold",
      },
      {
        color: "#a855f7",
        "text-decoration-style": "dotted",
        "text-decoration-line": "underline",
        "text-decoration-color": "white",
        "font-weight": "bold",
        "font-size": "50",
      },
      {
        color: "white",
        "text-decoration-style": "dotted",
        "text-decoration-line": "underline",
        "text-decoration-color": "white",
        "font-weight": "bold",
        "font-size": "50",
      },
      link?.name,
      {
        "font-weight": "400",
        color: "white",
        "margin-top": "-20px",
      },
    ],
  };

  return (
    getUrl() +
    (innerImg as any).url.replace("_server", "_server/") +
    `&args=${encodeURIComponent(JSON.stringify(props.values))}`
  );
};
