import {fetchWrapper} from "../fetchWrapper";
import {UpdateProjectMetaData} from "../../types/ProjectTypes";

export const createProject = async (projectData: { country: string; initiator_organization_uid: string; name: string, data: UpdateProjectMetaData }) => {
  try {
    return await fetchWrapper(`/api/project`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: JSON.stringify(projectData),
    });
  } catch (e) {
    throw e;
  }
};
