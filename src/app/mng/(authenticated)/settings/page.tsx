import prisma from "@/lib/db";
import SettingsClient from "@/components/admin/settings-client";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const fees = await prisma.fee.findMany({
    orderBy: { createdAt: "desc" }
  });

  return <SettingsClient initialFees={fees} />;
}
