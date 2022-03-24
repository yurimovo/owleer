import { fetchWrapper } from "../fetchWrapper";
import {UpdateProjectType} from "../../types/ProjectTypes";

export const UpdateProject = async (
    project_uid: string,
    data?: UpdateProjectType
) => {
    const organizationData = JSON.stringify(data);
    try {
        await fetchWrapper(`/api/project/${project_uid}`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            body: organizationData,
        });
    } catch (e) {
        throw e;
    }
};