import { useAuth } from "@solid-mediakit/auth/client";
import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  ParentComponent,
  Setter,
  useContext,
} from "solid-js";
import Pusher from "pusher-js";
import { Contact, Events } from "./events";
import toast from "solid-toast";

const contactsContext = createContext<{
  contacts: Accessor<Contact[]>;
  setContacts: Setter<Contact[]>;
}>(null!);

export const ContactsProvider: ParentComponent = (props) => {
  const auth = useAuth();
  const [contacts, setContacts] = createSignal<Contact[]>([]);

  const combinedContacts = createMemo(
    on(
      () => [auth.session(), contacts()],
      () => {
        const userContacts = (auth.session()?.user.contacts ?? []).map((e) => {
          return {
            img: e.user.image,
            name: e.user.name,
            id: e.user.id,
            notifications: 0,
          } satisfies Contact;
        });
        const currentContacts = contacts()!;
        return [...userContacts, ...currentContacts];
      }
    )
  );

  let r = false;
  createEffect(() => {
    if (auth.status() !== "loading" && !r) {
      r = true;
      const client = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      });
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

      onCleanup(() => {
        client.unsubscribe(name);
      });
    }
  });

  return (
    <contactsContext.Provider
      value={{
        contacts: combinedContacts,
        setContacts,
      }}
    >
      {props.children}
    </contactsContext.Provider>
  );
};

export const useContacts = () => {
  const ctx = useContext(contactsContext);
  if (!ctx) {
    throw new Error("useContacts Was Used Incorrectly");
  }
  return ctx.contacts;
};

export const alterContacts = () => {
  const ctx = useContext(contactsContext);
  if (!ctx) {
    throw new Error("useContacts Was Used Incorrectly");
  }
  return ctx.setContacts;
};
