import { resetPasswordForEmailFirebase } from "../../firebase";

type resetPasswordForEmailType = (email: string) => Promise<void>;

export const resetPasswordForEmail: resetPasswordForEmailType = (email) =>
  new Promise(async (resolve, reject) => {
    try {
      await resetPasswordForEmailFirebase(email);
      resolve();
    } catch (e) {
      reject(e.code);
    }
  });
