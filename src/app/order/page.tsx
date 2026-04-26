import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import MenuContent from "@/components/menu/content";

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
