import { FileSystemObject } from "./FileTypes";

export type FileToPrint = {
  file: FileSystemObject;
  workType: string; // With color or not.
  foldingType: string;
  pageSize: string;
  copies: number;
  description: string;
};

export type RecipientAddress = {
  office: string;
  name: string;
  address: string;
  description: string;
};

export type PrintingOrder = {
  customerDetails: {
    name: string;
    phone: string;
    project: string;
    orderingOffice: string;
  };
  files: Array<FileToPrint>;
  recipientAddresses: Array<RecipientAddress>;
};
