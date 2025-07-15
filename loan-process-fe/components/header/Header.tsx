import Link from "next/link";
import { VpbankLogo } from "@/components/vpbank-logo";

export function Header() {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 flex justify-center gap-[60px] items-center">
                <Link href="/">
                    <VpbankLogo className="h-8" />
                </Link>
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="#loan-form" className="text-gray-600 hover:text-vp-green font-medium">Vay vốn</Link>
                    <Link href="#" className="text-gray-600 hover:text-vp-green font-medium">Gửi tiết kiệm</Link>
                    <Link href="#" className="text-gray-600 hover:text-vp-green font-medium">Thẻ</Link>
                    <Link href="#" className="text-gray-600 hover:text-vp-green font-medium">Hỗ trợ</Link>
                </nav>
            </div>
        </header>
    )
}