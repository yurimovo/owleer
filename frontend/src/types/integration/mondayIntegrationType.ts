export type MondayProfile = {
  name: string;
  email: string;
  photo: string;
};

export type BoardUpdate = {
  body: string;
  created_at: Date;
  creator: MondayProfile;
};

export type BoardType = {
  id: number;
  name: string;
  state: string;
  updated_at: Date;
  updates: Array<BoardUpdate>;
  owner: MondayProfile;
};

export type BoardItemColumnAdditionalData = {
  label: string | undefined | null;
  color: string | undefined | null;
  changed_at: Date | undefined | null;
};

export type BoardItemColumn = {
  text: string | undefined | null;
  title: string | undefined | null;
  type: string | undefined | null;
  additional_info: BoardItemColumnAdditionalData;
};

export type BoardItem = {
  id: string;
  name: string;
  created_at: string;
  colums: Array<BoardItemColumn>;
};
