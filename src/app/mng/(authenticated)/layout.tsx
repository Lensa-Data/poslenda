import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "../admin.css";
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
    redirect("/mng/login" as any);
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
      />
      <div
        className="admin-layout min-h-screen"
        style={{ backgroundColor: "var(--a-bg)", color: "var(--a-on-surface)" }}
      >
        <Sidebar
          user={{ name: session.user.name, email: session.user.email }}
        />
        <main
          className="md:ml-64 min-h-screen p-6 md:p-10 pb-28 md:pb-10"
          style={{ backgroundColor: "var(--a-bg)" }}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </>
  );
}
