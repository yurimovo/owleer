import { ProjectPrintingAgency } from "../../types/ProjectTypes";
import { fetchWrapper } from "../fetchWrapper";

export const fetchProjectPrintingAgencies = async (project_uid: string) => {
  try {
    const r = await fetchWrapper(
      `/api/project/${project_uid}/printing_agency/list`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    const data = await r.json();
    return data as Array<ProjectPrintingAgency>;
  } catch (e) {
    throw e;
  }
};
