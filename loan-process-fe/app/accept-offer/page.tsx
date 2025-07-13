'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AcceptOfferPage() {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get('applicationId');

    useEffect(() => {
        if (applicationId) {
            fetch('/api/confirm-offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId })
            });
        }
    }, [applicationId]);

    return <div>Cảm ơn bạn đã xác nhận! Chúng tôi đang xử lý...</div>;
}