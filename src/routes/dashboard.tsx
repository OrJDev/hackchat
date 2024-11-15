import "~/styles/scroll.css";
import { useAuth } from "@solid-mediakit/auth/client";
import { Meta, Title } from "@solidjs/meta";
import { FaSolidArrowDown, FaSolidPlus } from "solid-icons/fa";
import {
  Accessor,
  Component,
  createEffect,
  createMemo,
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
import { LoadingIndicator, RenderUserImage } from "~/components";
import { Message, useContacts, useInnerContext } from "~/utils/contacts";
import { AiOutlineSend } from "solid-icons/ai";
import { Contact } from "~/utils/events";
import { BiRegularParty } from "solid-icons/bi";

const Dashboard: VoidComponent = () => {
  const contacts = useContacts();
  const auth = useAuth();
  const [addingContact, setAddingContact] = createSignal(false);
  const innerContext = useInnerContext();

  const [selectedContact, setSelectedContact] = createSignal<Contact | null>(
    null
  );

  const messages = createMemo(
    on(
      () => [selectedContact(), innerContext.messages()],
      () => {
        const s = selectedContact();
        if (s) {
          const m = innerContext.messages();
          return m[s.id] ?? [];
        }
        return [];
      }
    )
  );

  const isSmall = createMediaQuery("(max-width: 767px)");

  let chatRef: HTMLDivElement;

  createEffect(
    on(selectedContact, (s) => {
      if (s && chatRef) {
        chatRef.scrollTop = chatRef.scrollHeight;
      }
    })
  );

  createEffect(
    on(
      () => [selectedContact(), innerContext.status()] as const,
      ([c, s]) => {
        if (c && s[c.id] === false) {
          toast.error(`${c.name} Went Offline`);
          setSelectedContact(null);
        }
      }
    )
  );

  return (
    <>
      <Title>HackChat - Dashboard</Title>
      <Meta
        name="viewport"
        content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi"
      />
      <main class="grid grid-cols-3 h-[calc(100vh-theme(space.24))] w-full">
        <Show when={!isSmall() || !selectedContact()}>
          <div
            class={`col-span-1 ${
              isSmall() ? "w-screen" : ""
            } bg-zinc-900 text-offwhite border-r border-zinc-700 px-4 overflow-y-auto scrollbar animate-fadeIn`}
          >
            <div class="flex w-full flex-col px-4 gap-8 fixed top-[96px] left-0 z-[995] bg-zinc-900 h-[80px]">
              <div class="flex items-center  justify-between w-full relative top-1/2 -translate-y-1/2">
                <h2
                  class={`text-xl font-bold ${
                    selectedContact() ? "text-purple-400" : ""
                  }`}
                >
                  {selectedContact()
                    ? selectedContact()?.name
                    : "Your Contacts"}
                </h2>

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
                <div class="flex flex-col gap-5 items-center text-center mt-[80px]">
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
              <ul class="flex flex-col gap-1 mt-[80px] pb-24">
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
                <Empty last />
              </ul>
            </Show>
          </div>
        </Show>
        <Show
          when={selectedContact()}
          fallback={
            isSmall() ? null : (
              <div class="h-full w-full flex items-center flex-col gap-2 mt-[80px]">
                <h1 class="font-bold text-white text-2xl py-12 -ml-3">
                  Select A Contact
                </h1>
              </div>
            )
          }
        >
          {(contact) => (
            <div
              id="chat"
              ref={(r) => (chatRef = r)}
              class={`col-span-2 ${
                isSmall() ? "w-screen" : ""
              } h-full animate-fadeIn overflow-y-scroll scrollbar`}
            >
              <RenderChat
                myId={() => auth.session()?.user.id!}
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
    class={`w-[10px] ${
      props.sm ? "h-[30px]" : props.last ? "h-[200px]" : "h-[100px]"
    } ${props.last ? "isEmpty" : ""}`}
  />
);

const RenderChat: Component<{
  messages: Accessor<Message[]>;
  isSmall: Accessor<boolean>;
  resetContact: () => void;
  contact: Accessor<Contact>;
  myId: Accessor<string>;
}> = (props) => {
  const [message, setMessage] = createSignal("");
  const innerContext = useInnerContext();

  const handleMessage = () => {
    if (!innerContext.status()[props.contact().id]) {
      toast.error(`${props.contact().name} Is Offline`);
      props.resetContact();
    } else {
      innerContext.sendMessage(props.contact().id, message());
      setMessage("");
    }
  };

  return (
    <div class="flex flex-col gap-2 px-8 h-full w-full">
      <Show when={props.isSmall()}>
        <div class="font-bold px-4 transition-all gap-2 h-[80px] flex items-center text-offwhite text-2xl top-[96px] fixed z-[992] w-full bg-[#000]">
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
          <span>{props.contact().name}</span>
        </div>
      </Show>
      <Show
        when={props.messages().length}
        fallback={
          <div class="text-2xl font-bold text-white mt-[80px] p-24 flex flex-col gap-2 items-center justify-center">
            {innerContext.loading() ? (
              <div class="flex gap-2 items-center mt-[80px]">
                Loading... <LoadingIndicator white />
              </div>
            ) : (
              <>
                <span>Be The First To Start The Conversation.</span>
                <BiRegularParty
                  class="fill-current text-purple-500/30"
                  size={50}
                />
              </>
            )}
          </div>
        }
      >
        <div class="flex flex-col gap-2 pb-12 mt-[80px]">
          <Empty sm />
          <For each={props.messages()}>
            {(message) => {
              return (
                <div
                  class={`message ${
                    message.sentBy === props.myId()
                      ? "bg-purple-500 ml-auto border-purple-700 rounded-bl-lg"
                      : "border border-solid border-gray-700 mr-auto rounded-br-lg"
                  } w-fit flex items-center p-3 text-white border border-solid rounded-tl-lg rounded-tr-lg`}
                >
                  {message.content}
                </div>
              );
            }}
          </For>
          <Empty last />
        </div>
      </Show>
      <div class="w-[80%] bg-[#000] z-[996] md:w-[60%] flex justify-between px-5 text-offwhite font-medium  border border-gray-300 p-3 rounded-lg fixed bottom-6 focus:outline-none">
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleMessage();
            }
          }}
          value={message()}
          onInput={(e) => setMessage(e.currentTarget.value)}
          placeholder="Message"
          class="w-full placeholder:font-bold caret-purple-500 bg-inherit focus:outline-none"
        />
        <button
          onClick={() => handleMessage()}
          disabled={!message().length}
          class="text-purple-500 disabled:text-gray-500"
        >
          <AiOutlineSend class="fill-current transition-colors" size={30} />
        </button>
      </div>
    </div>
  );
};

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
      onClick={() => {
        if (props.onClick) {
          if (!props.contact.online) {
            return toast.error(`${props.contact.name} Is Offline`);
          }
          props.onClick();
        }
      }}
      disabled={props.contact.online === null}
      class="py-2 group w-full text-offwhite relative h-14 flex gap-2 items-center border-b-[0.5px] border-b-gray-100/20"
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
      {props.contact.online === null ? (
        <div class="absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center">
          <LoadingIndicator />
        </div>
      ) : (
        <div
          class={`absolute animate-fadeIn top-1/2 -translate-y-1/2 right-2 border border-solid ${
            props.contact.online ? "border-green-500" : "border-red-500"
          } rounded-full w-8 h-8 flex items-center justify-center `}
        >
          <div
            class={`h-[70%] w-[70%] rounded-full ${
              props.contact.online ? "bg-green-300" : "bg-red-300"
            }`}
          />
        </div>
      )}
    </button>
  );
};
