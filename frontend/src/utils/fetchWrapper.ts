import { getAuthUserToken } from "./auth/getAuthUserToken";
import { refreshToken } from "../firebase";

export async function fetchWrapper(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const obj = init || {};
  const headers =
    obj.headers || ({ "Content-Type": "application/json" } as any);
  let token = getAuthUserToken();

  if (token) {
    token && (headers.Authorization = `Bearer ${token}`);
  }

  if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";

  if (headers["Content-Type"] === "multipart/form-data") {
    delete headers["Content-Type"];
  }
  obj.headers = headers;

  // @ts-ignore

  return new Promise(async (resolve, reject) => {
    const res = await fetch(input, obj);
    if (res.status === 401) {
      const token = await refreshToken();
      localStorage.setItem("authToken", token.access_token);
      const method = init?.method;
      let headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      };
      const body = init?.body;
      const reResponse = await fetch(input, { method, headers, body });
      if (!reResponse?.ok) {
        reject(reResponse);
      } else {
        resolve(reResponse);
      }
    } else {
      resolve(res);
    }
  });
}
