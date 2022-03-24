import { createUserOnFirebase } from "../../firebase";
import { createUser } from "./createUser";

type doRegisterType = (
  email: string,
  password: string,
  name: string,
  company: string,
  role: string
) => Promise<void>;

export const doRegister: doRegisterType = (
  email,
  password,
  name,
  company,
  role
) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await createUserOnFirebase(email, password);
      if (user) {
        user.getIdToken().then(async (jwtToken: string) => {
          localStorage.setItem("authToken", jwtToken);
          await createUser(email, name, company, role, user.uid);
        });
      }
      resolve();
    } catch (e) {
      reject(e);
    }
  });
