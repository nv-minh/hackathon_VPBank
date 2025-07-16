import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden text-white bg-gradient-to-r from-vp-green to-green-700">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container relative px-4 py-20 mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            Giải Pháp Tài Chính
            <span className="block text-vp-lime">Thịnh Vượng & Bền Vững</span>
          </h1>
          <p className="mb-8 text-xl text-green-100 md:text-2xl">
            Lãi suất ưu đãi, thủ tục đơn giản, phê duyệt nhanh chóng. Cùng
            VPBank kiến tạo tương lai.
          </p>
          <div className="flex flex-col justify-center gap-4 mb-12 sm:flex-row">
            <Button
              size="lg"
              className="px-8 py-4 font-semibold bg-vp-lime hover:bg-vp-lime-dark text-vp-green"
            >
              <Link href="#loan-form" className="flex items-center">
                Đăng Ký Vay Ngay <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-white bg-transparent border-white cursor-pointer"
            >
              <Link href="/auth/signin">Đăng Nhập</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-8 mt-16 md:grid-cols-3">
            <div className="flex flex-col items-center">
              <Shield className="w-12 h-12 mb-4 text-vp-lime" />
              <h3 className="mb-2 text-lg font-semibold">Bảo Mật Cao</h3>
              <p className="text-green-100">
                Thông tin được mã hóa và bảo vệ tuyệt đối
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-12 h-12 mb-4 text-vp-lime" />
              <h3 className="mb-2 text-lg font-semibold">Xử Lý Nhanh</h3>
              <p className="text-green-100">
                Phê duyệt trong vòng 24 giờ làm việc
              </p>
            </div>
            <div className="flex flex-col items-center">
              <DollarSign className="w-12 h-12 mb-4 text-vp-lime" />
              <h3 className="mb-2 text-lg font-semibold">Lãi Suất Ưu Đãi</h3>
              <p className="text-green-100">
                Mức lãi suất cạnh tranh nhất thị trường
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
