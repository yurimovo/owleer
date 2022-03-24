import { FileToPrint } from "./PrintaryTypes";

export type OrderDetails = {
  name: string | undefined;
  office: string | undefined;
  phone: string | undefined;
  onAccount: string | undefined;
};

type OrderFileData = {
  folding: string;
  workType: string;
  description: string;
  copies: number;
  pageSize: string;
};

export type OrderFile = {
  path: string;
  uid: string;
  data: OrderFileData;
};

type OrderAddress = {
  name: string;
  address: string;
  description: string;
};

type OrderAgency = {
  uid: string;
  name: string;
};

export type OrderType = {
  customer_details: OrderDetails;
  agency: OrderAgency;
  approved: boolean;
  files: Array<FileToPrint>;
  creation_time: Date | string;
  address: OrderAddress;
};

export type OrderCustomerDetails = {
  name: string;
  office: string;
  phone: string;
};

export type OrderOnList = {
  uid: string;
  approved: boolean;
  order_type: string;
  customer_details: OrderCustomerDetails;
  creation_time: Date;
  file_count: number;
};

export type FileFetchOnOrder = {
  uid: string;
  path: string;
  data: {
    folding: string;
    workType: string;
    description: string;
    copies: number;
    pageSize: string;
  };
};

export type OrderCreate = {
  customer_details: OrderDetails;
  agency: { uid: string; name: string };
  files: Array<OrderFile>;
  address: OrderAddress;
};

export type OrderCreateFile = {
  uid: string;
  data: OrderFileData;
};
