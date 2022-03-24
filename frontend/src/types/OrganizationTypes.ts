export type UserInOrganizationData = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
};

export type UserInOrhanization = {
  is_admin: boolean;
  user: UserInOrganizationData;
};

export type Organization = {
  uid: string;
  created_at: string;
  is_admin: boolean;
  name: string;
  image_url: string | null;
  users: Array<UserInOrhanization>;
};

export type OrganizationUpdate = {
  name: string | null | undefined;
  image_url: string | null | undefined;
};

export type OrganizationInSearchList = {
  uid: string;
  name: string;
  image_url: string | undefined | null;
};
