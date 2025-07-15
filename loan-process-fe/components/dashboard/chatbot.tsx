"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, User, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// @ts-ignore
import readVNNumber from '@oorts/read-vn-number';
import {toast} from "sonner";

interface Message {
  id: string
  type: "bot" | "user"
  content: string
  timestamp: Date
}

interface ChatBotProps {
  onClose: () => void
}

export function ChatBot({ onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Xin chào! Tôi là trợ lý ảo của ngân hàng. Bạn có muốn đăng ký một khoản vay mới không? Nếu có hãy nhập giá trị mà bạn muốn vay.",
      timestamp: new Date(),
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [loanAmount, setLoanAmount] = useState<string>("")
  const [showLoanInput, setShowLoanInput] = useState(true)
  const [inputError, setInputError] = useState<string | null>(null)
  const [loanAmountInWords, setLoanAmountInWords] = useState<string>("");

  useEffect(() => {
    const numericValue = parseFloat(loanAmount.replace(/\./g, ''));
    if (!isNaN(numericValue) && numericValue > 0) {
      try {
        const words = readVNNumber.toVNWord(numericValue);
        setLoanAmountInWords(words);
      } catch (error) {
        setLoanAmountInWords("");
      }
    } else {
      setLoanAmountInWords("");
    }
  }, [loanAmount]);

  const handleLoanRegistration = async (wantsLoan: boolean) => {
    if (!wantsLoan) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: "Không, cảm ơn",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsProcessing(true)
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
            "Cảm ơn bạn! Nếu có nhu cầu vay vốn trong tương lai, đừng ngần ngại liên hệ với chúng tôi. Chúc bạn một ngày tốt lành!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsProcessing(false)
      setShowLoanInput(false)
      return
    }

    if (wantsLoan && loanAmount) {
      const amount = parseFloat(loanAmount.replace(/\./g, ''));
      if (isNaN(amount) || amount <= 0) {
        setInputError("Vui lòng nhập số tiền hợp lệ lớn hơn 0.");
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: `Có, tôi muốn vay ${loanAmount} VNĐ`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsProcessing(true)
      setInputError(null);

      try {
        const response = await fetch("/api/submit-application", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ loanAmount: amount }),
        })

        const data = await response.json()

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: response.ok
              ? `Tuyệt vời! Tôi đã tạo một hồ sơ vay mới cho bạn với mã số: ${data.applicationId}. Chuyên viên tư vấn sẽ sớm liên hệ với bạn. Để được xử lý nhanh hơn, bạn có thể bổ sung thông tin chi tiết tại trang quản lý hồ sơ.`
              : `Rất tiếc, đã có lỗi xảy ra: ${data.message || 'Vui lòng thử lại sau.'}`,
          timestamp: new Date(),
        }
        toast.success("Thành công!", { description: "Hồ sơ vay vốn của bạn đã được tạo." });

        setMessages((prev) => [...prev, botResponse])
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: "Xin lỗi, có lỗi kết nối. Vui lòng thử lại sau hoặc liên hệ hotline 1900 1234.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsProcessing(false)
        setShowLoanInput(false)
      }
    } else if (wantsLoan && !loanAmount) {
      setInputError("Vui lòng nhập số tiền bạn muốn vay.");
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return "";

    const formatted = new Intl.NumberFormat('vi-VN').format(Number(numericValue));
    return formatted;
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLoanAmount(formatCurrency(value));
    if (inputError) {
      setInputError(null);
    }
  };

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Trợ Lý Ảo</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message) => (
              <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                      message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
              >
                <div className={`p-2 rounded-full ${message.type === "bot" ? "bg-blue-100" : "bg-gray-100"}`}>
                  {message.type === "bot" ? (
                      <Bot className="h-4 w-4 text-blue-600" />
                  ) : (
                      <User className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <Card className={`max-w-xs ${message.type === "user" ? "bg-blue-600 text-white" : "bg-white"}`}>
                  <CardContent className="p-3">
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>
          ))}
        </div>

        {showLoanInput && !isProcessing && (
            <div className="space-y-3">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="loanAmount" className="text-base font-semibold text-gray-800">
                  Nhập số VNĐ bạn muốn vay
                </Label>
                <Input
                    type="text"
                    id="loanAmount"
                    placeholder="Ví dụ: 100.000.000"
                    value={loanAmount}
                    onChange={handleLoanAmountChange}
                    className={inputError ? "border-red-500" : ""}
                />
                {inputError && <p className="text-red-500 text-xs">{inputError}</p>}
                {loanAmountInWords && !inputError && (
                    <p className="text-gray-600 text-xs mt-1">{loanAmountInWords}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                    onClick={() => handleLoanRegistration(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="sm"
                    disabled={isProcessing}
                >
                  Có
                </Button>
                <Button
                    onClick={() => handleLoanRegistration(false)}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    disabled={isProcessing}
                >
                  Không
                </Button>
              </div>
            </div>
        )}

        {isProcessing && (
            <div className="text-center py-2">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Đang xử lý...</span>
              </div>
            </div>
        )}
      </div>
  )
}