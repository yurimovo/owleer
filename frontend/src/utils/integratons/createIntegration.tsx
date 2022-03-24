import {IntegrationCreateType} from "../../types/integration/IntegrationType";
import {fetchWrapper} from "../fetchWrapper";


export const createIntegration = async (data: IntegrationCreateType) => {
    const body = JSON.stringify(data)
    try {
        const r = await fetchWrapper(`/api/integration`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            body: body
        });
        return await r.json()
    } catch (e) {
        throw e;
    }
};