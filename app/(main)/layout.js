import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/config/auth";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/inner-api/auth/signin?callbackUrl=%2F");
  }

  return (
    <DashboardLayoutClient userName={session?.user?.name}>
      {children}
    </DashboardLayoutClient>
  );
}
