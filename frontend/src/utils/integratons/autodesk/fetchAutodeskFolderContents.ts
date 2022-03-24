import { AutodeskFolderContents } from "../../../types/integration/autodeskIntegrationTypes";
import { fetchWrapper } from "../../fetchWrapper";


export const fetchAutodeskFolderContents = async (projectId: string | undefined, folderUrn: string | undefined) => {
    try {
        const r = await fetchWrapper(`/api/integration/autodesk/projects/${projectId}/folder/${folderUrn}/contents`, {
            method: "GET",
            mode: "cors",
            credentials: "include",
        });
        const data = await r.json()
        return data as AutodeskFolderContents
    } catch (e) {
        throw e;
    }
};