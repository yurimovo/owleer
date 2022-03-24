import {fetchWrapper} from "../../fetchWrapper";

export const fetchUserZoom = async () => {
    try {
        const r = await fetchWrapper(`/api/integration/zoom/profile`, {
            method: "GET",
            mode: "cors",
        });
        return await r.json()
    } catch (e) {
        throw e;
    }
};