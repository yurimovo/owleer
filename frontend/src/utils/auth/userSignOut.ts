import { logoutUserFromFirebase } from "../../firebase";

export const userSignOut = async () => {
  await logoutUserFromFirebase();
};
