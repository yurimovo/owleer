import { fetchWrapper } from "../../fetchWrapper";

export const sendInviteLink = async (data :{
    invite_link: string,
    emails: Array<string>
}) => {
    try {
        return await fetchWrapper(`/api/integration/zoom/send/invite_links`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            body: JSON.stringify(data),
        });
    } catch (e) {
        throw e;
    }
};
