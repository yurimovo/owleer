import { UserSearchRecord } from "../../types/UserTypes";
import { fetchWrapper } from "../fetchWrapper";

export const searchUsers = async (query: string) => {
  try {
    const r = await fetchWrapper(`/api/user/search?query=${query}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r.ok) throw new Error(r.statusText);
    const data = await r.json();
    return data as Array<UserSearchRecord>;
  } catch (e) {
    throw e;
  }
};
