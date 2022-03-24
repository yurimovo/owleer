import { FileVersion } from "../../types/FileTypes";
import { fetchWrapper } from "../fetchWrapper";

export const listFileVersions = async (fileUid: string) => {
  try {
    const r = await fetchWrapper(`/api/project/file/${fileUid}/version/list`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r?.ok) throw new Error(r.statusText);
    return (await r.json()) as Array<FileVersion>;
  } catch (e) {
    throw e;
  }
};
