export interface Contact {
  img?: string | null;
  notifications?: number;
  name?: string | null;
  id: string;
}

export interface MessageSent {
  by: string;
  content: string;
  messageId: string;
}

export type Events = {
  contact_added: Contact;
  message_sent: MessageSent;
};
