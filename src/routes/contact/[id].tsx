import { Title } from "@solidjs/meta";
import { useNavigate, useParams } from "@solidjs/router";
import { VoidComponent } from "solid-js";
import toast from "solid-toast";
import { RenderPRPCData, RenderUserImage } from "~/components";
import { acceptContact, getContactLink } from "~/server/contacts";
import { alterContacts } from "~/utils/contacts";
import { wrapWithTry } from "~/utils/helpers";

const Contact: VoidComponent = () => {
  const params = useParams<{ id: string }>();
  const link = getContactLink(() => ({ id: params.id }));

  const acceptLink = acceptContact();

  const disabled = () => !params.id || acceptLink.isPending;
  const navigate = useNavigate();

  const setContacts = alterContacts();

  return (
    <>
      <Title>HackChat - Accept Contact</Title>
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
          <span class="font-bold mt-4 text-lg sm:text-xl text-offwhite">
            Do You Want To Accept His Request?
          </span>
          <div class="flex gap-2 items-center justify-center w-full">
            <button
              disabled={disabled()}
              onClick={() =>
                void wrapWithTry(() =>
                  acceptLink.mutateAsync({ id: params.id }).then(() => {
                    toast.success(`${link.data?.name} Is Now In Your Contacts`);
                    setContacts((prev) => [
                      {
                        img: link.data?.image,
                        name: link.data?.name,
                        id: link.data?.id as string,
                      },
                      ...prev,
                    ]);
                    navigate("/dashboard");
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
            you messages, you can also ignore this request for now and accept it
            later.
          </p>
        </RenderPRPCData>
      </main>
    </>
  );
};

export default Contact;
