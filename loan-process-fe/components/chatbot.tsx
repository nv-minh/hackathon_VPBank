"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, X } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: input }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const botMessage: Message = {
        sender: "bot",
        text: data.response || "Tôi không nhận được phản hồi.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      const errorMessage: Message = {
        sender: "bot",
        text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed z-50 bottom-4 right-4">
      {/* Cửa sổ chat */}
      {isOpen && (
        <Card className="w-80 h-[500px] flex flex-col shadow-lg sm:w-96">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Bot" />
                <AvatarFallback>BOT</AvatarFallback>
              </Avatar>
              <CardTitle>Chatbot Tư Vấn</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {/* Tin nhắn mặc định */}
                {messages.length === 0 && (
                  <div className="flex items-start gap-3 text-sm">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="Bot"
                      />
                      <AvatarFallback>BOT</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="font-bold">Bot</div>
                      <div className="text-sm prose">
                        <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Render danh sách tin nhắn */}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 text-sm ${
                      message.sender === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src="https://github.com/shadcn.png"
                          alt="Bot"
                        />
                        <AvatarFallback>BOT</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>ME</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {/* Hiệu ứng "Bot is typing..." */}
                {isLoading && (
                  <div className="flex items-start gap-3 text-sm">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="Bot"
                      />
                      <AvatarFallback>BOT</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="px-3 py-2 rounded-lg bg-muted">...</div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={handleSendMessage}
              className="flex items-center w-full space-x-2"
            >
              <Input
                id="message"
                placeholder="Nhập tin nhắn..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="w-4 h-4" />
                <span className="sr-only">Gửi</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Nút bấm để mở/đóng chat */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="w-16 h-16 rounded-full shadow-lg"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
        <span className="sr-only">Toggle Chat</span>
      </Button>
    </div>
  );
}
