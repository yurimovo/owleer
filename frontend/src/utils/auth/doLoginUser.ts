import { doUserLoginOnFirebase } from "../../firebase";

type doLoginType = (email: string, password: string) => Promise<any>;

export const doLogin: doLoginType = (email, password) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await doUserLoginOnFirebase(email, password);
      if (user) {
        user.getIdToken().then((jwtToken: string) => {
          localStorage.setItem("authToken", jwtToken);
        });
      }
      resolve(user);
    } catch (e) {
      reject(e);
    }
  });
