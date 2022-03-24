import { fetchWrapper } from "../fetchWrapper";
import { CompanyCreateType } from "../../types/CompanyTypes";


export const createOrganization = async (data: CompanyCreateType) => {
    const userEmail = JSON.stringify(data)
    try {
        await fetchWrapper(`/api/company`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            body: userEmail
        });
    } catch (e) {
        throw e;
    }
};