import "~/styles/scroll.css";
import { useAuth } from "@solid-mediakit/auth/client";
import { Title } from "@solidjs/meta";
import { FaSolidPlus } from "solid-icons/fa";
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
import { FiArrowLeft, FiSearch } from "solid-icons/fi";
import { createMediaQuery } from "@solid-primitives/media";
import { faker } from "@faker-js/faker";

const Dashboard: VoidComponent = () => {
  const auth = useAuth();
  const [addingContact, setAddingContact] = createSignal(false);
  const [selectedContact, setSelectedContact] = createSignal<Contact | null>(
    null
  );

  const contacts = () =>
    new Array(18).fill(null).map(() => {
      return {
        img: faker.image.avatar(), // Generates a realistic avatar image URL
        name: faker.person.fullName(), // Generates a realistic full name
        notifications: faker.number.int({ min: 1, max: 50 }), // Generates a random number between 1 and 50
      };
    });

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
        <AddContact contacts={contacts} close={() => setAddingContact(false)} />
      </Show>
    </>
  );
};

export default Dashboard;

const Empty: Component<{ sm?: boolean; last?: boolean }> = (props) => (
  <div
    class={`w-[10px] ${props.sm ? "h-[10px]" : "h-[100px]"} ${
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
      <div class="font-bold px-4 transition-all gap-2 min-h-[80px] flex items-center text-offwhite text-2xl top-0 right-0 left-0 sticky w-full bg-[#000]">
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

      <div class="flex flex-col gap-2 pb-12">
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
