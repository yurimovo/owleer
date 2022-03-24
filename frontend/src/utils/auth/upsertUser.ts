import { fetchWrapper } from "../fetchWrapper";

export const upsertUser = async (
  name?: string,
  email?: string,
  phone?: string,
  role?: string,
  data?: object
) => {
  try {
    const body = JSON.stringify({ name, email, phone, role, data });
    const r = await fetchWrapper(`/api/user/upsert`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: body,
    });

    return await r.json();
  } catch (e) {
    throw e;
  }
};
