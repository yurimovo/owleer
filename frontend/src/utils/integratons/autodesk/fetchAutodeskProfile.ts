import { AutodeskProfile } from "../../../types/integration/autodeskIntegrationTypes";
import { fetchWrapper } from "../../fetchWrapper";


export const fetchAutodeskProfile = async () => {
    try {
        const r = await fetchWrapper(`/api/integration/autodesk/profile`, {
            method: "GET",
            mode: "cors",
            credentials: "include",
        });
        if (!r.ok) {
            throw Error(r.statusText)
        }
        const data = await r.json()
        return data as AutodeskProfile
    } catch (e) {
        throw e;
    }
};