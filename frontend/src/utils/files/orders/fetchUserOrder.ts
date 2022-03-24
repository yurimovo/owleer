import { fetchWrapper } from "../../fetchWrapper";
import { OrderOnList, OrderType } from "../../../types/OrderTypes";

export const fetchUserOrder = async (project_uid: string) => {
  try {
    const r = await fetchWrapper(
      `/api/project/${project_uid}/order/list/user`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    return (await r.json()) as Array<OrderOnList>;
  } catch (e) {
    throw e;
  }
};
