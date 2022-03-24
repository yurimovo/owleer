import { Email } from "../../types/CommunicationTypes";
import { fetchWrapper } from "../fetchWrapper";

export const paginateMails = async (page: number, size: number) => {
  try {
    const r = await fetchWrapper(
      `/api/communication/email/list?page=${page}&size=${size}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r?.ok) throw new Error(r.statusText);
    const data = await r.json();
    return data as { emails: Array<Email>; total: number };
  } catch (e) {
    throw e;
  }
};
