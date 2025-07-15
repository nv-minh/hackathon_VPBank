"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calculator, FileText, User } from "lucide-react"

export function LoanForm() {
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "", loanAmount: "", loanPurpose: "", monthlyIncome: "", employmentType: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
      <section id="loan-form" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-vp-green mb-4">Đăng Ký Vay Vốn Trực Tuyến</h2>
              <p className="text-xl text-gray-600">Hoàn tất biểu mẫu trong 2 phút để bắt đầu</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-vp-green" />
                      Thông Tin Đăng Ký
                    </CardTitle>
                    <CardDescription>Vui lòng cung cấp thông tin chính xác để được hỗ trợ tốt nhất</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Họ và Tên *</Label>
                          <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} placeholder="Nguyễn Văn A" required />
                        </div>
                        <div>
                          <Label htmlFor="phone">Số Điện Thoại *</Label>
                          <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="0901234567" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="email@example.com" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="loanAmount">Số Tiền Vay (VNĐ) *</Label>
                          <Input id="loanAmount" value={formData.loanAmount} onChange={(e) => handleInputChange("loanAmount", e.target.value)} placeholder="100,000,000" required />
                        </div>
                        <div>
                          <Label htmlFor="monthlyIncome">Thu Nhập Hàng Tháng (VNĐ)</Label>
                          <Input id="monthlyIncome" value={formData.monthlyIncome} onChange={(e) => handleInputChange("monthlyIncome", e.target.value)} placeholder="20,000,000" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="loanPurpose">Mục Đích Vay *</Label>
                          <Select onValueChange={(value) => handleInputChange("loanPurpose", value)}>
                            <SelectTrigger><SelectValue placeholder="Chọn mục đích vay" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="house">Mua nhà</SelectItem>
                              <SelectItem value="car">Mua xe</SelectItem>
                              <SelectItem value="business">Kinh doanh</SelectItem>
                              <SelectItem value="education">Học tập</SelectItem>
                              <SelectItem value="personal">Cá nhân</SelectItem>
                              <SelectItem value="other">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="employmentType">Loại Hình Công Việc</Label>
                          <Select onValueChange={(value) => handleInputChange("employmentType", value)}>
                            <SelectTrigger><SelectValue placeholder="Chọn loại công việc" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employee">Nhân viên</SelectItem>
                              <SelectItem value="business-owner">Chủ doanh nghiệp</SelectItem>
                              <SelectItem value="freelancer">Tự do</SelectItem>
                              <SelectItem value="retired">Nghỉ hưu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Ghi Chú Thêm</Label>
                        <Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} placeholder="Thông tin bổ sung..." rows={3} />
                      </div>
                      <Button type="submit" className="w-full bg-vp-green hover:bg-vp-green-dark" size="lg">Gửi Đăng Ký</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center"><Calculator className="mr-2 h-5 w-5 text-vp-green" />Ước Tính Khoản Vay</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between"><span className="text-gray-600">Lãi suất từ:</span><span className="font-semibold text-vp-green">6.5%/năm</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Thời hạn vay:</span><span className="font-semibold">1-20 năm</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Hạn mức tối đa:</span><span className="font-semibold">5 tỷ VNĐ</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Phí xử lý:</span><span className="font-semibold">Miễn phí</span></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-vp-green" />Hỗ Trợ Khách Hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div><p className="text-sm text-gray-600">Hotline:</p><p className="font-semibold text-vp-green">1900 545415</p></div>
                      <div><p className="text-sm text-gray-600">Email:</p><p className="font-semibold">support@vpbank.com.vn</p></div>
                      <div><p className="text-sm text-gray-600">Giờ làm việc:</p><p className="font-semibold">8:00 - 17:00 (T2-T6)</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}