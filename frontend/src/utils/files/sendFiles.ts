import { SendFiles } from "../../types/FileTypes";
import { fetchWrapper } from "../fetchWrapper";

export const sendFiles = async (data: SendFiles) => {
  const bodyData = JSON.stringify(data);

  try {
    const r = await fetchWrapper(`/api/project/file/send`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: bodyData,
    });

    if (!r?.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};
