import { fetchWrapper } from "../../fetchWrapper";

export const approveOrder = async (order_uid: string) => {
    try {
        await fetchWrapper(`/api/project/order/${order_uid}/approve`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
        });
    } catch (e) {
        throw e;
    }
};
