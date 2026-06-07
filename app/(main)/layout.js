import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getNextAuthToken } from "@/config/nextAuthToken";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = await getNextAuthToken(cookieStore);

  if (!token?.accessToken) {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}
