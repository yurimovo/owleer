import { AutodeskProject } from "../../../types/integration/autodeskIntegrationTypes";
import { fetchWrapper } from "../../fetchWrapper";


export const fetchAutodeskProjects = async () => {
    try {
        const r = await fetchWrapper(`/api/integration/autodesk/projects`, {
            method: "GET",
            mode: "cors",
            credentials: "include",
        });
        const data = await r.json()
        return data as Array<AutodeskProject>
    } catch (e) {
        throw e;
    }
};