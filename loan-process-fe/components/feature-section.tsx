import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Shield, Users, Zap, Award } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: CheckCircle,
      title: "Thủ Tục Đơn Giản",
      description: "Chỉ cần CMND và giấy tờ thu nhập, không cần tài sản đảm bảo",
    },
    {
      icon: Clock,
      title: "Giải Ngân Nhanh",
      description: "Phê duyệt trong 24h, giải ngân ngay sau khi ký hợp đồng",
    },
    {
      icon: Shield,
      title: "Bảo Mật Tuyệt Đối",
      description: "Thông tin khách hàng được mã hóa và bảo vệ theo chuẩn quốc tế",
    },
    {
      icon: Users,
      title: "Tư Vấn Chuyên Nghiệp",
      description: "Đội ngũ chuyên viên giàu kinh nghiệm hỗ trợ 24/7",
    },
    {
      icon: Zap,
      title: "Lãi Suất Cạnh Tranh",
      description: "Mức lãi suất ưu đãi nhất thị trường, minh bạch và rõ ràng",
    },
    {
      icon: Award,
      title: "Uy Tín Hàng Đầu",
      description: "Được tin tưởng bởi hàng triệu khách hàng trên toàn quốc",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại Sao Chọn Chúng Tôi?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Với hơn 10 năm kinh nghiệm trong lĩnh vực tài chính, chúng tôi cam kết mang đến dịch vụ vay vốn tốt nhất cho
            khách hàng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Sẵn Sàng Bắt Đầu?</h3>
          <p className="text-xl mb-6 text-blue-100">Hãy để chúng tôi giúp bạn hiện thực hóa ước mơ của mình</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#loan-form"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Đăng Ký Ngay
            </a>
            <a
              href="tel:19001234"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Gọi Tư Vấn: 1900 1234
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
