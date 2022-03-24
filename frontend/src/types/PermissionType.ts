export type GrantPermission = {
  objectUid: string;
  objectName: string;
  userEmail: string;
  permission: string;
};

export type Permission = {
  uid: string;
  type: string;
  object_uid: string;
  object_name: string;
  user: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
};
