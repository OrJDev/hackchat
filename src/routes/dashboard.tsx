import "~/styles/scroll.css";
import { useAuth } from "@solid-mediakit/auth/client";
import { Title } from "@solidjs/meta";
import { FaSolidArrowDown, FaSolidPlus } from "solid-icons/fa";
import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  Show,
  VoidComponent,
} from "solid-js";
import { FiArrowLeft } from "solid-icons/fi";
import { createMediaQuery } from "@solid-primitives/media";
import { wrapWithTry } from "~/utils/helpers";
import { isServer } from "solid-js/web";
import toast from "solid-toast";
import { RenderUserImage } from "~/components";
import { useContacts } from "~/utils/contacts";

const Dashboard: VoidComponent = () => {
  const auth = useAuth();
  const [addingContact, setAddingContact] = createSignal(false);

  const contacts = useContacts();

  const [selectedContact, setSelectedContact] = createSignal<Contact | null>(
    null
  );

  const messages = () =>
    new Array(18).fill(null).map((_, i) => {
      return {
        me: i % 2 === 0,
        message:
          i % 2 === 0
            ? `Hey there ${selectedContact()?.name}`
            : `How are you ${auth.session()?.user.name}`,
      };
    });

  const isSmall = createMediaQuery("(max-width: 767px)");

  let chatRef: HTMLDivElement;

  createEffect(
    on(
      () => [selectedContact(), chatRef],
      () => {
        if (chatRef) {
          chatRef.scrollTop = chatRef.scrollHeight;
        }
      }
    )
  );

  return (
    <>
      <Title>HackChat - Dashboard</Title>
      <main class="grid grid-cols-3 h-screen w-full">
        <Show when={!isSmall() || !selectedContact()}>
          <div
            class={`col-span-1 ${
              isSmall() ? "w-screen" : ""
            } bg-zinc-900 text-offwhite border-r border-zinc-700 px-4 overflow-y-auto scrollbar animate-fadeIn`}
          >
            <div class="flex w-full flex-col gap-8 sticky top-0 left-0 right-0 z-[995] bg-zinc-900 h-[80px]">
              <div class="flex items-center justify-between w-full relative top-1/2 -translate-y-1/2">
                <h2 class="text-xl font-bold">Your Contacts</h2>

                <button
                  onClick={() => setAddingContact(true)}
                  class="border group transition-colors hover:border-gray-400 w-8 h-8 flex items-center justify-center border-solid border-gray-300 rounded-full"
                >
                  <FaSolidPlus
                    size={15}
                    color="white"
                    class="fill-current text-white group-hover:text-gray-400 transition-all"
                  />
                </button>
              </div>
              <div class="w-full bg-purple-500 h-[0.5px] rounded-lg" />
            </div>

            <Show
              when={contacts().length}
              fallback={
                <div class="flex flex-col gap-5 items-center text-center">
                  <span class="font-bold text-white">No Contacts?</span>
                  <FaSolidArrowDown color="white" size={30} />
                  <div class="text-offwhite text-sm font-medium ">
                    Share Your{" "}
                    <span class="underline decoration-dotted decoration-purple-500">
                      Contact URL
                    </span>
                    To Get To Know More People
                  </div>
                  <button
                    class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-white font-bold transition-all text-sm w-32 h-12 rounded-lg p-3 flex items-center justify-center"
                    style={{
                      "box-shadow": `0 0 0 1px #555`,
                    }}
                    onClick={() => setAddingContact(true)}
                  >
                    Share
                  </button>
                </div>
              }
            >
              <ul class="flex flex-col gap-1 mt-2 pb-24">
                <For each={contacts()}>
                  {(contact) => {
                    return (
                      <RenderContact
                        contact={contact}
                        onClick={() => setSelectedContact(contact)}
                      />
                    );
                  }}
                </For>
                <Empty />
              </ul>
            </Show>
          </div>
        </Show>
        <Show
          when={selectedContact()}
          fallback={
            isSmall() ? null : (
              <div class="h-full w-full flex items-center flex-col gap-2">
                <h1 class="font-bold text-white text-2xl py-12">
                  Select A Contact
                </h1>
              </div>
            )
          }
        >
          {(contact) => (
            <div
              ref={(r) => (chatRef = r)}
              class={`col-span-2 ${
                isSmall() ? "w-screen" : ""
              } h-full animate-fadeIn overflow-y-scroll scrollbar`}
            >
              <RenderChat
                messages={messages}
                isSmall={isSmall}
                resetContact={() => setSelectedContact(null)}
                contact={contact}
              />
            </div>
          )}
        </Show>
      </main>
      <Show when={addingContact()}>
        <AddContact
          userId={auth.session()?.user.id!}
          contacts={contacts}
          close={() => setAddingContact(false)}
        />
      </Show>
    </>
  );
};

export default Dashboard;

const Empty: Component<{ sm?: boolean; last?: boolean }> = (props) => (
  <div
    class={`w-[10px] ${props.sm ? "h-[30px]" : "h-[100px]"} ${
      props.last ? "isEmpty" : ""
    }`}
  />
);

const RenderChat: Component<{
  messages: Accessor<{ me: boolean; message: string }[]>;
  isSmall: Accessor<boolean>;
  resetContact: () => void;
  contact: Accessor<Contact>;
}> = (props) => {
  return (
    <div class="flex flex-col gap-2 px-8 h-full w-full">
      <div class="font-bold px-4 transition-all gap-2 h-[80px] flex items-center text-offwhite text-2xl top-[96px] fixed z-[992] w-full bg-[#000]">
        <Show when={props.isSmall()}>
          <button
            onClick={() => props.resetContact()}
            class="border group transition-colors hover:border-gray-400 w-8 h-8 flex items-center justify-center border-solid border-gray-300 rounded-full"
          >
            <FiArrowLeft
              size={15}
              color="white"
              class="fill-current text-white group-hover:text-gray-400 transition-all"
            />
          </button>
        </Show>
        <span>{props.contact().name}</span>
      </div>

      <div class="flex flex-col gap-2 pb-12 mt-[80px]">
        <Empty sm />
        <For each={props.messages()}>
          {(message) => {
            return (
              <div
                class={`message ${
                  message.me
                    ? "bg-purple-500 ml-auto border-purple-700 rounded-bl-lg"
                    : "border border-solid border-gray-700 mr-auto rounded-br-lg"
                } w-fit flex items-center p-3 text-white border border-solid rounded-tl-lg rounded-tr-lg`}
              >
                {message.message}
              </div>
            );
          }}
        </For>
        <Empty last />
      </div>
    </div>
  );
};

interface Contact {
  img?: string | null;
  notifications?: number;
  name?: string | null;
}
const AddContact: Component<{
  contacts: Accessor<Array<Contact>>;
  close: () => void;
  userId: string;
}> = (props) => {
  const [closing, setClosing] = createSignal(false);

  createEffect(() => {
    if (closing()) {
      const timeout = setTimeout(() => {
        props.close();
      }, 200);
      onCleanup(() => clearTimeout(timeout));
    }
  });

  const origin = () =>
    isServer ? process.env.AUTH_URL : window.location.origin;

  const link = () => `${origin()}/contact/${props.userId}`;

  const copyLink = async () => {
    await wrapWithTry(async () => {
      await navigator.clipboard.writeText(link());
      toast.success("Link Copied To Clipboard");
      props.close();
    });
  };

  return (
    <>
      <button
        onClick={() => setClosing(true)}
        style={{ background: "rgba(0, 0, 0, 0.4)" }}
        class="fixed cursor-default inset-0 z-[998] h-screen w-screen"
      />
      <div
        class={`w-[90vw] ${
          closing() ? "animate-fadeOut" : "animate-fadeIn"
        } transition-all scrollbar sm:w-[70vw] lg:w-[50vw] z-[999] bg-zinc-900 fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-xl flex gap-2 overflow-y-scroll items-center p-5 flex-col`}
      >
        <div class="flex flex-col gap-2 w-full items-center">
          <h1 class="text-xl font-bold text-white">
            Add A{" "}
            <strong class="underline decoration-dotted decoration-purple-500">
              Contact
            </strong>
          </h1>
          <p class="text-offwhite text-sm max-w-[300px] text-center font-medium">
            Copy the link bellow and share it with a friend you want to talk
            with on <strong class="text-purple-500 font-bold">HackChat</strong>.
          </p>
          <pre
            class={`bg-zinc-500 md:bg-[#000] w-full rounded-lg p-3 flex items-center justify-center`}
          >
            <span class="text-gray-500 font-bold text-xs hidden md:block">
              {link()}
            </span>
            <button
              onClick={() => void copyLink()}
              class="flex md:hidden w-full h-full items-center justify-center"
            >
              <svg
                class={`h-6 w-6 fill-current text-offwhite`}
                viewBox="0 0 20 20"
              >
                <path
                  d="M16.667 1.66675H6.66699C5.74783 1.66675 5.00033 2.41425 5.00033 3.33341V5.00008H3.33366C2.41449 5.00008 1.66699 5.74758 1.66699 6.66675V16.6667C1.66699 17.5859 2.41449 18.3334 3.33366 18.3334H13.3337C14.2528 18.3334 15.0003 17.5859 15.0003 16.6667V15.0001H16.667C17.5862 15.0001 18.3337 14.2526 18.3337 13.3334V3.33341C18.3337 2.41425 17.5862 1.66675 16.667 1.66675ZM13.3337 16.6667H3.33366V6.66675H5.00033V13.3334C5.00033 14.2526 5.74783 15.0001 6.66699 15.0001H13.3337V16.6667ZM16.6645 13.3334H6.66699V3.33341H16.667L16.6645 13.3334Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
          </pre>

          <div class="mb-3 w-full bg-gray-500 h-[0.5px] rounded-lg" />
        </div>
        <button
          onClick={() => void copyLink()}
          class="font-bold md:flex text-white hidden items-center justify-center disabled:animate-pulse disabled:bg-purple-400 bg-purple-500 rounded-lg w-[80%] p-3 mt-auto"
        >
          Copy Link And Close
        </button>
        <p class="text-gray-400 text-center font-bold text-sm">
          Keep in mind, anyone who gets this link can click on it and get in
          your contacts.
        </p>
      </div>
    </>
  );
};

const RenderContact: Component<{
  contact: Contact;
  modal?: boolean;
  onClick?: () => any;
}> = (props) => {
  return (
    <button
      onClick={props.onClick}
      class="py-2 w-full text-offwhite relative h-14 flex gap-2 items-center border-b-[0.5px] border-b-gray-100/20"
    >
      <RenderUserImage
        alwaysSm
        name={props.contact.name}
        img={props.contact.img}
      />
      <div class="w-[0.5px] h-full bg-gray-100/20 rounded-lg" />
      <span
        class={`font-bold truncate text-[16px] ${
          props.modal ? "text-gray-500" : "max-w-[100px]"
        }`}
      >
        {props.contact.name}
      </span>
      {!props.modal && props.contact.notifications ? (
        <div class="absolute top-1/2 -translate-y-1/2 right-2 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
          <span class="text-white font-bold text-sm">
            {props.contact.notifications > 99
              ? "+99"
              : props.contact.notifications}
          </span>
        </div>
      ) : null}
    </button>
  );
};
