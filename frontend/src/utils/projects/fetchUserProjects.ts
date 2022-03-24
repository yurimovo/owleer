import { UserProjectsPerOrgItem } from "../../types/ProjectTypes";
import { fetchWrapper } from "../fetchWrapper";

export const fetchUserProjects = async () => {
  try {
    const r = await fetchWrapper(`/api/project/list`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r.ok) throw new Error(r.statusText);
    const data = await r.json();
    return data as Array<UserProjectsPerOrgItem>;
  } catch (e) {
    throw e;
  }
};
