import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Vay Vốn Nhanh Chóng
            <span className="block text-yellow-300">An Toàn & Tin Cậy</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Giải pháp tài chính linh hoạt với lãi suất ưu đãi, thủ tục đơn giản, phê duyệt nhanh chỉ trong 24 giờ
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4">
              <Link href="#loan-form" className="flex items-center">
                Đăng Ký Ngay <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 bg-transparent"
            >
              <Link href="/auth/signin">Đăng Nhập</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-yellow-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bảo Mật Cao</h3>
              <p className="text-blue-100">Thông tin được mã hóa và bảo vệ tuyệt đối</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-yellow-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Xử Lý Nhanh</h3>
              <p className="text-blue-100">Phê duyệt trong vòng 24 giờ làm việc</p>
            </div>
            <div className="flex flex-col items-center">
              <DollarSign className="h-12 w-12 text-yellow-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lãi Suất Ưu Đãi</h3>
              <p className="text-blue-100">Mức lãi suất cạnh tranh nhất thị trường</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
