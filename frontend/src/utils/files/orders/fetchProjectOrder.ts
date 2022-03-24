import { fetchWrapper } from "../../fetchWrapper";
import { OrderOnList } from "../../../types/OrderTypes";

export const fetchProjectOrder = async (project_uid: string) => {
  try {
    const r = await fetchWrapper(`/api/project/${project_uid}/order/list`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    return (await r.json()) as Array<OrderOnList>;
  } catch (e) {
    throw e;
  }
};
