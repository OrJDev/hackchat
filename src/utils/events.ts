export interface Contact {
  img?: string | null;
  notifications?: number;
  name?: string | null;
  id: string;
}

export type Events = {
  contact_added: Contact;
};
