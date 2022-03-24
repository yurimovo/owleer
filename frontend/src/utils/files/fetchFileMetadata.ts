import { FileMetadata } from "../../types/FileTypes";
import { fetchWrapper } from "../fetchWrapper";

export const fetchFileMetadata = async (fileUid: string) => {
  try {
    const r = await fetchWrapper(`/api/project/file/${fileUid}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r?.ok) throw new Error(r.statusText);

    const data = await r.json();
    return data as FileMetadata;
  } catch (e) {
    throw e;
  }
};
