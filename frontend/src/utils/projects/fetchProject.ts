import { Project } from "../../types/ProjectTypes";
import { fetchWrapper } from "../fetchWrapper";


export const fetchProject = async (uid: string) => {
    try {
        const r = await fetchWrapper(`/api/project/${uid}`, {
            method: "GET",
            mode: "cors",
            credentials: "include"
        });
        if (!r.ok) throw new Error(r.statusText);
        const data = await r.json()
        return data as Project
    } catch (e) {
        throw e;
    }
}