import { Project } from "../../types/ProjectTypes";
import { fetchWrapper } from "../fetchWrapper";

export const deleteProject = async (uid: string) => {
  try {
    const r = await fetchWrapper(`/api/project/${uid}`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
    });
    if (!r?.ok) throw new Error(r?.statusText);
  } catch (e) {
    throw e;
  }
};
