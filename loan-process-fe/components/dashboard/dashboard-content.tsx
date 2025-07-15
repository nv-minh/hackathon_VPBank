"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatBot } from "@/components/dashboard/chatbot"
import { FormInputProfile } from "@/components/dashboard/FormInputProfile"
import { signOut } from "next-auth/react"
import { User, LogOut, MessageCircle } from "lucide-react"
import type { Session } from "next-auth"

interface DashboardContentProps {
  session?: Session
}

export function DashboardContent({ session }: DashboardContentProps) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchProfileId() {
      setIsLoadingProfile(true);
      try {
        const response = await fetch('/api/user-info');
        if (response.ok) {
          const data = await response.json();
          setProfileId(data.hasProfile);
          setHasProfile(true);
        } else if (response.status === 404) {
          setProfileId(null);
          setHasProfile(false);
        } else {
          console.error("Failed to fetch profile ID:", await response.text());
          setProfileId(null);
          setHasProfile(false);
        }
      } catch (error) {
        console.error("Error fetching profile ID:", error);
        setProfileId(null);
        setHasProfile(false);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfileId();
  }, []);

  const handleProfileCreated = (newProfileId: string) => {
    setProfileId(newProfileId);
    setHasProfile(true);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Hệ Thống Vay Vốn</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{session?.user?.name || session?.user?.email}</span>
                </div>
                <Button
                    variant="outline"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className={`grid grid-cols-1 ${hasProfile ? "lg:grid-cols-3" : ""} gap-8`}>
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chào mừng bạn đến với hệ thống!</CardTitle>
                  <CardDescription>Quản lý các khoản vay và theo dõi trạng thái đăng ký của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Khoản Vay Hiện Tại</h3>
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-sm text-blue-700">Chưa có khoản vay nào</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Đơn Đăng Ký</h3>
                      <p className="text-2xl font-bold text-green-600">0</p>
                      <p className="text-sm text-green-700">Chưa có đơn nào</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lịch Sử Giao Dịch</CardTitle>
                  <CardDescription>Theo dõi các giao dịch và thanh toán của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có giao dịch nào</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {isLoadingProfile ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Đang tải...</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Đang kiểm tra thông tin hồ sơ của bạn...</p>
                    </CardContent>
                  </Card>
              ) : (
                  hasProfile ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Trợ Lý Ảo
                          </CardTitle>
                          <CardDescription>Tôi có thể giúp bạn đăng ký khoản vay</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChatBot onClose={() => { }} />
                        </CardContent>
                      </Card>
                  ) : (
                      <FormInputProfile onProfileCreated={handleProfileCreated} />
                  )
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Thông Tin Hỗ Trợ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Hotline:</p>
                    <p className="font-semibold text-blue-600">1900 1234</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email:</p>
                    <p className="font-semibold">support@bank.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giờ hỗ trợ:</p>
                    <p className="font-semibold">8:00 - 17:00 (T2-T6)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
  )
}