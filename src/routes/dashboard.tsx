import { useAuth } from "@solid-mediakit/auth/client";
import { Title } from "@solidjs/meta";
import { FaSolidPlus } from "solid-icons/fa";
import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  VoidComponent,
} from "solid-js";
import { FiArrowLeft, FiSearch } from "solid-icons/fi";
import { createMediaQuery } from "@solid-primitives/media";

const Dashboard: VoidComponent = () => {
  const auth = useAuth();
  const [addingContact, setAddingContact] = createSignal(false);
  const [selectedContact, setSelectedContact] = createSignal<Contact | null>(
    null
  );

  const contacts = () =>
    new Array(18).fill(null).map((_, i) => {
      return {
        img: auth.session()?.user.image!,
        name: `${auth.session()?.user.name}${i + 1}`,
        notifications: (i + 1) * 2,
      };
    });

  const messages = () =>
    new Array(10).fill(null).map((_, i) => {
      return {
        me: i % 2 === 0,
        message:
          i % 2 === 0
            ? `Hey there ${selectedContact()?.name}`
            : `How are you ${auth.session()?.user.name}`,
      };
    });

  const isSmall = createMediaQuery("(max-width: 767px)");

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
              <div class="w-full h-[100px]" />
            </ul>
          </div>
        </Show>
        <Show
          when={selectedContact()}
          fallback={
            <div class="h-full w-full flex items-center flex-col gap-2">
              <h1 class="font-bold text-white text-2xl py-12">
                Select A Contact
              </h1>
            </div>
          }
        >
          {(contact) => (
            <div
              class={`col-span-2 overflow-y-auto max-h-[calc(100vh-80px)] ${
                isSmall() ? "w-screen" : ""
              } animate-fadeIn`}
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
        <AddContact contacts={contacts} close={() => setAddingContact(false)} />
      </Show>
    </>
  );
};

export default Dashboard;

const RenderChat: Component<{
  messages: Accessor<{ me: boolean; message: string }[]>;
  isSmall: Accessor<boolean>;
  resetContact: () => void;
  contact: Accessor<Contact>;
}> = (props) => {
  let chatRef: HTMLDivElement;
  onMount(() => {
    const lastMessage = chatRef.querySelector(".message:last-child");
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });
  return (
    <div class="flex flex-col gap-2 justify-center px-8">
      <div class="font-bold transition-all gap-2 h-[50px] flex items-center text-offwhite text-2xl top-0 right-0 left-0 sticky w-full bg-[#000]">
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
        {props.contact().name}
      </div>
      <div class="flex flex-col gap-2 pb-12" ref={(r) => (chatRef = r)}>
        <For each={props.messages()}>
          {(message) => {
            return (
              <div
                class={`message ${
                  message.me
                    ? "bg-purple-400 ml-auto border-purple-700 rounded-bl-lg"
                    : "border border-solid border-gray-700 mr-auto rounded-br-lg"
                } w-fit flex items-center p-3 text-white border border-solid rounded-tl-lg rounded-tr-lg`}
              >
                {message.message}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

interface Contact {
  img: string;
  notifications?: number;
  name: string;
}
const AddContact: Component<{
  contacts: Accessor<Array<Contact>>;
  close: () => void;
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

  return (
    <>
      <button
        onClick={() => setClosing(true)}
        style={{ background: "rgba(0, 0, 0, 0.4)" }}
        class="fixed cursor-default inset-0 z-[998] h-screen w-screen"
      />
      <div
        class={`w-[80vw] ${
          closing() ? "animate-fadeOut" : "animate-fadeIn"
        } transition-all scrollbar sm:w-[50vw] z-[999] h-[400px] bg-zinc-900 fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-xl flex gap-2 overflow-y-scroll items-center px-5 flex-col`}
      >
        <div
          class={`w-full left-0 right-0 border-b-[0.5px] border-b-purple-500  sticky bg-zinc-900 z-[996] top-0 flex gap-2 items-center`}
        >
          <FiSearch color="white" size={30} />
          <input
            type="text"
            placeholder="Name"
            class="bg-inherit w-full text-offwhite placeholder:text-gray-200 font-bold rounded-lg p-3 focus:outline-none caret-purple-500"
          />
        </div>
        <div class="w-full flex flex-col justify-center">
          <For each={props.contacts()}>
            {(contact) => {
              return <RenderContact contact={contact} modal />;
            }}
          </For>
        </div>
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
      <img
        src={props.contact.img}
        class="object-contain h-10 w-10 rounded-full"
      />
      <div class="w-[0.5px] h-full bg-gray-100/20 rounded-lg" />
      <span class={`font-bold text-lg ${props.modal ? "text-gray-500" : ""}`}>
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
