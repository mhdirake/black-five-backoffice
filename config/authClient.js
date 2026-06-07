import { signOut } from "next-auth/react";

export const logout = async (callbackUrl = "/") => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("userToken");
  await signOut({ callbackUrl });
};
