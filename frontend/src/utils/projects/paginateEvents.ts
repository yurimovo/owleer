import { ProjectEvent } from "../../types/ProjectTypes";
import { fetchWrapper } from "../fetchWrapper";

export const paginateEvents = async (
  project_uid: string,
  page: number,
  size: number
) => {
  try {
    const r = await fetchWrapper(
      `/api/project/${project_uid}/events/list?page=${page}&size=${size}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r?.ok) throw new Error(r.statusText);
    const data = await r.json();
    return data as { events: Array<ProjectEvent>; total: number };
  } catch (e) {
    throw e;
  }
};
