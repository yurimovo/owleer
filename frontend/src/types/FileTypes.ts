import { BooleanLiteral } from "typescript";

export type FileOwner = {
  uid: string;
  name: string;
  role: string;
  email: string;
};

export type FileSystemObject = {
  Key: string;
  Name: string;
  uid: string;
  uri: string;
  description: string;
  versions_count: number;
  Size: string;
  LastModified: Date;
  user: FileOwner;
};

export type MovingObject = {
  uid: string;
  path: string;
};

export type FileSystemDirectoryObject = {
  uid: string;
  key: string;
  name: string;
};

export type FileSystemObjects = {
  files: Array<FileSystemObject>;
  directories: Array<FileSystemDirectoryObject>;
};

export type FileMetadata = {
  name: string;
  last_modified: Date;
  content_type: string;
  uri: string | undefined | null;
  data: object;
};

export type UploadedFile = {
  file_name: string;
  uid: string;
};

export type SendFiles = {
  files: Array<UploadedFile>;
  emails: Array<string>;
  message: string;
};

// Versions
export type FileVersionUser = {
  uid: string | undefined;
  name: string | undefined;
  role: string | undefined;
  email: string | undefined;
};
export type FileVersion = {
  uid: string;
  description: string;
  uri: string;
  user: FileVersionUser;
  created_at: Date;
  external_id: string;
};

// Issues
export type FileIssueData = {
  name?: string;
  description?: string;
  image_url?: string;
  data?: object;
};

export type FileIssue = {
  uid: string;
  name?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  data: { x: number; y: number; color: string };
  user: {
    uid: string;
    name?: string;
    role?: string;
  };
};

export type FileIssuesFilter = {
  user_emails: Array<string> | undefined | null;
  page: number | undefined | null;
};

// Comments
export type CommentData = {
  text?: string;
  data?: string;
};

export type CommentInList = {
  uid: string;
  text?: string;
  data?: object;
  created_at?: string;
  user: {
    uid: string;
    name?: string;
    role?: string;
  };
};

export type ListObjects = {
  result: FileSystemObjects;
  permitted_to_edit: boolean;
  folder_uid: string;
};

export type SelectedFile = {
  uid: string;
  file_name: string;
  path: string;
};

export type FilteredFileType = {
  Name: string;
  created_at: string;
  uid: string;
  uri: string;
  description: string;
  user: {
    email: string;
    name: string;
    role: string;
    uid: string;
  };
};

export type FilteredFilesDataType = {
  item: FilteredFileType;
};
