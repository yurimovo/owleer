import { fetchWrapper } from "../../fetchWrapper";
import { OrderType } from "../../../types/OrderTypes";

export const fetchOrderByUid = async (order_uid: string) => {
  try {
    const r = await fetchWrapper(`/api/project/order/${order_uid}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    return (await r.json()) as OrderType;
  } catch (e) {
    throw e;
  }
};
