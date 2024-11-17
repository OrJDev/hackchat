import { Meta, Title } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";
import {
  children,
  Component,
  createMemo,
  JSXElement,
  Show,
  VoidComponent,
} from "solid-js";
import toast from "solid-toast";
import { RenderPRPCData, RenderUserImage } from "~/components";
import { acceptContact, getContactLink } from "~/server/contacts";
import { alterContacts } from "~/utils/contacts";
import { wrapWithTry } from "~/utils/helpers";
import { DynamicImage } from "@solid-mediakit/og";
import { getUrl } from "~/utils/url";
import { useAuth } from "@solid-mediakit/auth/client";

const Contact: VoidComponent = () => {
  const params = useParams<{ id: string }>();
  const link = getContactLink(() => ({ id: params.id }));
  const auth = useAuth();
  const acceptLink = acceptContact();

  const disabled = () => !params.id || acceptLink.isPending;
  const navigate = useNavigate();

  const setContacts = alterContacts();

  return (
    <>
      <Title>HackChat - Accept Contact</Title>
      <div class="text-lg font-bold text-red-500">
        <Show when={link.data}>
          {(data) => (
            <>
              <RenderTags>
                <MetaImage data={data()} />
              </RenderTags>
            </>
          )}
        </Show>
      </div>
      <main class="flex flex-col gap-5 w-full h-full items-center">
        <RenderPRPCData data={link.data} error={link.error}>
          <div class="w-full flex gap-2 items-center justify-center px-3 py-1 sm:py-3 sm:px-12">
            <RenderUserImage sm img={link.data?.image} name={link.data?.name} />
            <div class="text-offwhite text-sm sm:text-xl font-bold">
              <strong class="text-gray-400">{link.data?.name}</strong>{" "}
              <br class="block sm:hidden" />
              Has Invited You To Talk On{" "}
              <span class="underline font-bold decoration-dotted decoration-purple-500">
                HackChat
              </span>
            </div>
          </div>
          <div class="w-[90%] -mt-4 bg-gray-500 rounded-lg h-[0.2px] self-center" />
          <Show
            when={auth.session()}
            fallback={
              <>
                <span class="font-bold mt-4 text-lg max-w-[400px] text-center sm:text-xl text-offwhite">
                  If you want to join{" "}
                  <strong class="text-purple-500 font-bold">
                    {link.data?.name}
                  </strong>{" "}
                  and many other people on this platform, you need to login.
                </span>
                <A
                  href="/auth"
                  class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-white font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
                  style={{
                    "box-shadow": `0 0 0 1px #555`,
                  }}
                >
                  Login
                </A>
              </>
            }
          >
            <span class="font-bold mt-4 text-lg sm:text-xl text-offwhite">
              Do You Want To Accept His Request?
            </span>
            <div class="flex gap-2 items-center justify-center w-full">
              <button
                disabled={disabled()}
                onClick={() =>
                  void wrapWithTry(() =>
                    acceptLink.mutateAsync({ id: params.id }).then(() => {
                      toast.success(
                        `${link.data?.name} Is Now In Your Contacts`
                      );
                      setContacts((prev) => [
                        {
                          img: link.data?.image,
                          name: link.data?.name,
                          id: link.data?.id as string,
                          online: null,
                        },
                        ...prev,
                      ]);
                      // navigate("/dashboard");
                      // refetch watchlist
                      window.location.href = "/dashboard";
                    })
                  )
                }
                class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-green-500 font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
                style={{
                  "box-shadow": `0 0 0 1px #555`,
                }}
              >
                Yes
              </button>
              <div class="h-[50px] w-[0.5px] rounded-lg bg-gray-400" />
              <button
                onClick={() => {
                  toast.success("You Can Change Your Mind Anytime");
                  navigate("/dashboard");
                }}
                disabled={disabled()}
                class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-red-500 font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
                style={{
                  "box-shadow": `0 0 0 1px #555`,
                }}
              >
                No
              </button>
            </div>
            <p class="text-offwhite font-medium max-w-[300px] sm:max-w-[400px] text-center">
              By accepting {link.data?.name}'s request, he will be able to send
              you messages, you can also ignore this request for now and accept
              it later.
            </p>
          </Show>
        </RenderPRPCData>
      </main>
    </>
  );
};

export default Contact;

// yes im not a bad dev, this is a very wrong way to write jsx
// but this is giving me the output i want so i couldn't care less
const MetaImage: Component<{
  data: { image?: string | null; name?: string | null };
}> = (props) => {
  return (
    <DynamicImage>
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          "background-color": "#000",
          "font-size": "32",
        }}
      >
        <img
          referrerpolicy="no-referrer"
          src={props.data?.image!}
          style={{
            height: "150",
            width: "150",
            "border-radius": "150",
            "margin-top": "20",
          }}
        />
        <div
          style={{
            display: "flex",
            "flex-direction": "row",
            width: "100%",
            gap: "8",
            "margin-top": "",
            "align-items": "center",
            "justify-content": "center",
            "font-weight": "bold",
          }}
        >
          <h1
            style={{
              color: "#a855f7",
              "text-decoration-style": "dotted",
              "text-decoration-line": "underline",
              "text-decoration-color": "white",
              "font-weight": "bold",
              "font-size": "50",
            }}
          >
            Add
          </h1>
          <span
            style={{
              color: "white",
              "text-decoration-style": "dotted",
              "text-decoration-line": "underline",
              "text-decoration-color": "white",
              "font-weight": "bold",
              "font-size": "50",
            }}
          >
            {props.data?.name}
          </span>
        </div>
        <span
          style={{
            "font-weight": "400",
            color: "white",
            "margin-top": "-20px",
          }}
        >
          On HackChat
        </span>
      </div>
    </DynamicImage>
  );
};

const RenderTags: Component<{ children: JSXElement }> = (props) => {
  const child = children(() => props.children);
  const url = createMemo(() => getUrl() + child()?.toString());
  return (
    <>
      <Meta property="og:image" content={url()} />
      <Meta name="twitter:image" content={url()} />
    </>
  );
};
