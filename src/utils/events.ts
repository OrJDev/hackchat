export interface Contact {
  img?: string | null;
  notifications?: number;
  name?: string | null;
  id: string;
  online: boolean | null;
}

export interface MessageSent {
  by: string;
  content: string;
  messageId: string;
}

export interface OnlineEvent {
  name: "online" | "offline";
  user_ids: string[];
}

export type Events = {
  contact_added: Contact;
  message_sent: MessageSent;
  "pusher:subscription_succeeded": {};
};
