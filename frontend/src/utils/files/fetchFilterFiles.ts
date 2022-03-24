import { fetchWrapper } from "../fetchWrapper";

export const fetchFilterFiles = async (project_uid: string, days_ago: string) => {
  try {
    const r = await fetchWrapper(`/api/project/${project_uid}/file/filter?days_ago=${days_ago}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r?.ok) throw new Error(r.statusText);

    const data = await r.json();
    return data;
  } catch (e) {
    throw e;
  }
};
