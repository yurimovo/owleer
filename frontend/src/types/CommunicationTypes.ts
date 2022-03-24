export type EmailRecipient = {
  name: string;
  email: string;
};

export type Email = {
  uid: string;
  subject: string;
  created_at: Date;
  recipient: EmailRecipient;
  delivered: boolean;
  delivery_date: Date;
  opened: boolean;
  open_date: Date;
};
