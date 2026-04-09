import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "./admin.css";
import Sidebar from "@/components/admin/sidebar";
import BottomNav from "@/components/admin/bottom-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div
      className="admin-layout min-h-screen"
      style={{ backgroundColor: "var(--a-bg)", color: "var(--a-on-surface)" }}
    >
      <Sidebar user={{ name: session.user.name, email: session.user.email }} />
      <main
        className="md:ml-64 min-h-screen p-6 md:p-10 pb-28 md:pb-10"
        style={{ backgroundColor: "var(--a-bg)" }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
