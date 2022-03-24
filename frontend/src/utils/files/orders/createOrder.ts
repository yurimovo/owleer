import { fetchWrapper } from "../../fetchWrapper";
import {OrderCreate, OrderType} from "../../../types/OrderTypes";

export const createOrder = async (project_uid: string, data: OrderCreate) => {
    const orderData = JSON.stringify(data)
    try {
        await fetchWrapper(`/api/project/${project_uid}/order`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            body: orderData
        });
    } catch (e) {
        throw e;
    }
};
