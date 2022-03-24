export type UserData = {
  name: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  role: string | undefined;
  paying: boolean;
  data: { language: string; company: string | undefined };
};
