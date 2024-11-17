import { useAuth } from "@solid-mediakit/auth/client";
import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
  ParentComponent,
  Setter,
  useContext,
} from "solid-js";
import Pusher from "pusher-js";
import { Contact, Events, OnlineEvent } from "./events";
import toast from "solid-toast";
import { triggerMessage } from "~/server/messages";
import { wrapWithTry } from "./helpers";
import { getUrl } from "./url";

function generateUniqueId(userId: string) {
  const timestamp = Date.now();
  return `${userId}-${timestamp}`;
}

const contactsContext = createContext<{
  contacts: Accessor<Contact[]>;
  setContacts: Setter<Contact[]>;
  sendMessage: (to: string, content: string) => void;
  messages: Accessor<Record<string, Message[]>>;
  loading: Accessor<boolean>;
  status: Accessor<Record<string, boolean | null>>;
  selectedContact: Accessor<Contact | null>;
  setSelectedContact: Setter<Contact | null>;
  resetMessages: () => void;
  getNotifs: (id: string) => number;
}>(null!);

export type Message = {
  content: string;
  sentAt: Date;
  sentBy: string;
  messageId: string;

  isNew?: boolean;
};

const messagePreifx = "hack_chat-";
export const ContactsProvider: ParentComponent = (props) => {
  const auth = useAuth();
  const [contacts, setContacts] = createSignal<Contact[]>([]);
  const [messages, setMessage] = createSignal<Record<string, Message[]>>({});
  const [loading, setLoading] = createSignal(true);
  const [selectedContact, setSelectedContact] = createSignal<Contact | null>(
    null
  );
  const [noficiations, setNotifications] = createSignal<Record<string, number>>(
    {}
  );

  const onSentMessage = (contact?: Contact) => {
    if (!contact || contact.id === selectedContact()?.id) {
      const chat = document.querySelector("#chat")!;
      chat.scrollTop = chat.scrollHeight;
    } else {
      setNotifications((prev) => ({
        ...prev,
        [contact.id]: (prev[contact.id] ?? 0) + 1,
      }));
      toast.success(`You received a message from ${contact.name}`);
    }
  };

  const callMessages = triggerMessage();

  onMount(() => {
    const newMessages: Record<string, Message[]> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(messagePreifx)) {
        const id = key.split(messagePreifx)[1];
        if (id) {
          const value = localStorage.getItem(key);
          if (value) {
            newMessages[id] = JSON.parse(value);
            const notifs = newMessages[id].filter((e) => e.isNew).length;
            if (notifs) {
              setNotifications((prev) => ({ ...prev, [id]: notifs }));
            }
          }
        }
      }
    }
    setMessage(newMessages);
    setLoading(false);
  });

  const sendMessage = async (to: string, content: string) => {
    const messageId = generateUniqueId(to);
    const currentMessages = messages()[to] ?? [];
    const newMessages = [
      ...currentMessages,
      {
        content,
        sentBy: auth.session()?.user.id!,
        sentAt: new Date(),
        messageId,
      },
    ] satisfies Message[];
    setMessage((prev) => ({ ...prev, [to]: newMessages }));
    onSentMessage();
    await wrapWithTry(async () => {
      await callMessages.mutateAsync({ id: to, content, messageId });
      updateMessages(to, content, messageId);
    });
  };

  const updateMessages = (
    to: string,
    content: string,
    messageId: string,
    notUs?: boolean,
    isNew?: boolean,
    removeNews?: boolean
  ) => {
    const currentMessages = messages()[to] ?? [];
    const newMessages = notUs
      ? ([
          ...currentMessages,
          {
            content,
            sentBy: to,
            sentAt: new Date(),
            messageId,
            isNew,
          },
        ] satisfies Message[])
      : currentMessages;

    localStorage.setItem(
      `${messagePreifx}${to}`,
      JSON.stringify(
        removeNews
          ? newMessages.map((_e) => {
              const e = { ..._e };
              delete e.isNew;
              return e;
            })
          : newMessages
      )
    );
    setMessage((prev) => ({ ...prev, [to]: newMessages }));
  };

  const [status, setStatus] = createSignal<Record<string, boolean | null>>({});
  const combinedContacts = createMemo(
    on(
      () => [auth.session(), contacts(), status()],
      () => {
        const s = status();
        const userContacts = (auth.session()?.user.contacts ?? []).map((e) => {
          return {
            img: e.user.image,
            name: e.user.name,
            id: e.user.id,
            notifications: 0,
          } satisfies Omit<Contact, "online">;
        });
        const currentContacts = contacts()!;
        return [...userContacts, ...currentContacts]
          .map((e) => {
            return {
              ...e,
              online: s[e.id] ?? null,
            };
          })
          .sort((a, b) => {
            if (a.online === b.online) return 0;
            if (a.online === true) return -1;
            if (b.online === true) return 1;
            if (a.online === null) return 1;
            if (b.online === null) return -1;
            return a.online ? -1 : 1;
          });
      }
    )
  );

  let r = false;
  createEffect(
    on(auth.session, () => {
      if (auth.status() === "authenticated" && !r) {
        r = true;
        const client = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
          cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
          userAuthentication: {
            endpoint: `${getUrl()}/api/watchlist`,
            transport: "ajax",
          },
        });
        client.signin();
        const update = (ids: string[], off?: boolean) => {
          setStatus((prev) => {
            const newRecord: Record<string, boolean | null> = { ...prev };
            for (const id of ids) {
              newRecord[id] = off ? false : true;
            }
            return newRecord;
          });
        };
        client.user.watchlist.bind("online", (event: OnlineEvent) =>
          update(event.user_ids)
        );
        client.user.watchlist.bind("offline", (event: OnlineEvent) =>
          update(event.user_ids, true)
        );

        const name = `${auth.session()?.user.id!}`;
        const sub = client.subscribe(name);
        const event = <N extends keyof Events>(
          name: N,
          cb: (data: Events[N]) => any
        ) => {
          return sub.bind(name, cb);
        };

        event("contact_added", (data) => {
          setContacts((prev) => [{ ...data, notifications: 0 }, ...prev]);
          toast.success(`You Can Now Chat With ${data.name}`);
        });

        event("message_sent", (data) => {
          const contact = combinedContacts().find((e) => e.id === data.by);
          if (contact) {
            updateMessages(
              data.by,
              data.content,
              data.messageId,
              true,
              contact.id !== selectedContact()?.id
            );
            onSentMessage(contact);
          }
        });

        onCleanup(() => {
          client.unsubscribe(name);
        });
      }
    })
  );
  const resetMessages = () => {
    const s = selectedContact();
    if (s) {
      setSelectedContact(null);
      setMessage((prev) => {
        const newMessages = {
          ...prev,
          [s.id]: prev[s.id].map((e) => {
            if (e.isNew) {
              e.isNew = false;
            }
            return e;
          }),
        };
        localStorage.setItem(
          `${messagePreifx}${s.id}`,
          JSON.stringify(newMessages[s.id])
        );
        return newMessages;
      });

      setNotifications((prev) => ({
        ...prev,
        [s.id]: 0,
      }));
    }
  };

  return (
    <contactsContext.Provider
      value={{
        contacts: combinedContacts,
        setContacts,
        sendMessage,
        messages,
        loading,
        status,
        selectedContact,
        setSelectedContact,
        resetMessages,
        getNotifs: (id: string) => noficiations()[id] ?? 0,
      }}
    >
      {props.children}
    </contactsContext.Provider>
  );
};

export const useInnerContext = () => {
  const ctx = useContext(contactsContext);
  if (!ctx) {
    throw new Error("useContacts Was Used Incorrectly");
  }
  return ctx;
};

export const useContacts = () => {
  const ctx = useInnerContext();
  return ctx.contacts;
};

export const alterContacts = () => {
  const ctx = useInnerContext();
  return ctx.setContacts;
};
