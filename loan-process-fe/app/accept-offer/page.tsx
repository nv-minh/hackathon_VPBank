"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const loadingSteps = [
  { text: "Khởi tạo và kiểm tra thông tin", progressThreshold: 0 },
  { text: "Gửi yêu cầu xác nhận đến hệ thống", progressThreshold: 30 },
  { text: "Đang chờ phản hồi từ máy chủ", progressThreshold: 60 },
  { text: "Hoàn tất và xử lý kết quả", progressThreshold: 90 },
];

export default function AcceptOfferPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Đang khởi tạo quá trình xác nhận...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleConfirmOffer = async () => {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 150);

      try {
        const applicationId = searchParams.get("applicationId");

        if (!applicationId) {
          throw new Error("Mã hồ sơ không hợp lệ hoặc đã hết hạn.");
        }

        setMessage("Đang gửi yêu cầu xác nhận...");

        const response = await fetch("/api/confirm-offer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Xác nhận đề nghị thành công!");

          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          throw new Error(
            data.message || "Có lỗi xảy ra trong quá trình xác nhận."
          );
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Không thể kết nối đến máy chủ.");
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
      }
    };

    handleConfirmOffer();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case "error":
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case "loading":
        return "bg-blue-600";
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      default:
        return "bg-yellow-600";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Hệ Thống Tuyển Dụng
          </h1>
          <p className="text-gray-600">Xác nhận đề nghị làm việc</p>
        </div>

        <div className="p-8 bg-white border border-gray-200 shadow-xl rounded-2xl">
          <div className="flex justify-center mb-6">{getStatusIcon()}</div>

          <div className="mb-6 text-center">
            <h2 className={`text-lg font-semibold mb-2 ${getStatusColor()}`}>
              {status === "loading" && "Đang xử lý..."}
              {status === "success" && "Thành công!"}
              {status === "error" && "Có lỗi xảy ra"}
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">{message}</p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2 text-xs text-gray-500">
              <span>Tiến trình</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Nội dung chi tiết theo trạng thái */}
          {status === "loading" && (
            <div className="space-y-3">
              {loadingSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      progress >= step.progressThreshold
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${
                      progress >= step.progressThreshold
                        ? "text-gray-800"
                        : "text-gray-500"
                    }`}
                  >
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 space-y-3">
              <Link
                href="/"
                className="block w-full px-4 py-2 text-center text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Quay lại trang chủ
              </Link>
            </div>
          )}

          {status === "success" && (
            <div className="text-center animate-pulse">
              <p className="text-sm font-medium text-green-600">
                Sẽ tự động chuyển hướng về trang chủ...
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Vui lòng không đóng trình duyệt trong quá trình xử lý.
          </p>
        </div>
      </div>
    </div>
  );
}
