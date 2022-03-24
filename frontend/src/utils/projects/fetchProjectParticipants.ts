import { Project } from "../../types/ProjectTypes";
import { fetchWrapper } from "../fetchWrapper";

export const fetchProjectParticipants = async (uid: string) => {
  try {
    const r = await fetchWrapper(`/api/project/${uid}/participants`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r.ok) throw new Error(r.statusText);
    const data = await r.json();
    return data as Array<{ name: string; email: string }>;
  } catch (e) {
    throw e;
  }
};
