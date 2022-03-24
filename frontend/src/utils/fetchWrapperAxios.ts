import { getAuthUserToken } from "./auth/getAuthUserToken";
import { refreshToken } from "../firebase";
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";

export async function fetchWrapperAxios(
  input: AxiosRequestConfig
): Promise<object> {
  input.headers = { "Content-Type": "application/json" } as AxiosRequestHeaders;

  let token = getAuthUserToken();

  if (token) {
    token && (input.headers.Authorization = `Bearer ${token}`);
  }

  if (!input.headers["Content-Type"])
    input.headers["Content-Type"] = "application/json";

  if (input.headers["Content-Type"] === "multipart/form-data") {
    delete input.headers["Content-Type"];
  }

  // @ts-ignore

  return new Promise(async (resolve, reject) => {
    const res = await axios.request(input);
    if (res.status === 401) {
      const token = await refreshToken();
      localStorage.setItem("authToken", token.access_token);

      input.headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      } as AxiosRequestHeaders;

      const reResponse = await axios.request(input);

      if (reResponse?.statusText !== "OK") {
        reject(reResponse.statusText);
      } else {
        resolve(reResponse.data);
      }
    } else {
      resolve(res.data);
    }
  });
}
