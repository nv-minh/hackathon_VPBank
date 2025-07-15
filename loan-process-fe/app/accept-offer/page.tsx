// app/accept-offer/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Import các component UI cần thiết
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularLoader } from '@/components/circular-loader'; // <-- Import loader mới

const CheckCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const XCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);


export default function AcceptOfferPage() {
    const searchParams = useSearchParams();

    // Quản lý trạng thái loading và kết quả
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<'success' | 'error' | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const applicationId = searchParams.get('applicationId');
        if (!applicationId) {
            setStatus('error');
            setMessage('Mã hồ sơ không hợp lệ hoặc đã hết hạn.');
            setIsLoading(false); // Dừng loading nếu có lỗi ngay
            return;
        }

        const confirmOffer = async () => {
            try {
                // await new Promise(resolve => setTimeout(resolve, 2000)); // Bỏ giả lập trễ ở đây

                const response = await fetch('/api/confirm-offer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ applicationId })
                });
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Xác nhận đề nghị thành công!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Không thể kết nối đến máy chủ.');
            } finally {
                setIsLoading(false); // <-- Dừng loading khi API hoàn tất
            }
        };

        confirmOffer();
    }, [searchParams]);

    // Hiển thị loader nếu đang loading
    if (isLoading) {
        return <CircularLoader />;
    }

    // Hiển thị Card kết quả sau khi loading xong
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            {status && ( // Chỉ hiển thị card nếu có status
                <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 duration-500">
                    <CardHeader className="flex flex-col items-center space-y-4">
                        {status === 'success' ? <CheckCircle /> : <XCircle />}
                        <CardTitle className={`text-2xl font-bold ${status === 'success' ? 'text-gray-900' : 'text-red-600'}`}>
                            {status === 'success' ? 'Xác nhận thành công' : 'Đã có lỗi xảy ra'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-gray-600 dark:text-gray-300">
                            {message}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/">Quay về trang chủ</Link>
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </main>
    );
}