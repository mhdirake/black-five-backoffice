import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/config/auth";
import Sidebar from "@/components/layout/Sidebar";
import { DashboardRoot, DashboardContent } from "./style";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/inner-api/auth/signin?callbackUrl=%2F");
  }

  return (
    <DashboardRoot dir={"rtl"}>
      <DashboardContent>{children}</DashboardContent>
      <Sidebar userName={session?.user?.name} />
    </DashboardRoot>
  );
}
