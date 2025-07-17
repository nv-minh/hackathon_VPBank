import { Suspense } from "react";
import AcceptOfferContent from "./accept-offer-client";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="mt-4 text-lg text-gray-700">Đang tải trang xác nhận...</p>
    </div>
  );
}

export default function AcceptOfferPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptOfferContent />
    </Suspense>
  );
}
