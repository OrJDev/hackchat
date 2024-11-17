import { createOpenGraphImage } from "@solid-mediakit/og/server";

export const GET = (event) => {
  const url = new URL(event.request.url);
  const name = url.searchParams.get("name");
  const image = url.searchParams.get("image");

  const args = [
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
    image,
    image,
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
    name,
    {
      "font-weight": "400",
      color: "white",
      "margin-top": "-20px",
    },
  ];
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
