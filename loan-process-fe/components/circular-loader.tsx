// components/ui/circular-loader.tsx
'use client';

import { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export function CircularLoader() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Giả lập tiến trình chạy từ 0 đến 99% trong 1.5 giây
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 99) {
                    clearInterval(interval);
                    return 99;
                }
                return prev + 1;
            });
        }, 15); // Cứ mỗi 15ms tăng 1%

        // Dọn dẹp interval khi component bị hủy
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div style={{ width: 120, height: 120 }}>
                <CircularProgressbar
                    value={progress}
                    text={`${progress}%`}
                    styles={buildStyles({
                        // Màu sắc
                        textColor: '#fff',
                        pathColor: '#2563eb', // Màu xanh của progress
                        trailColor: 'rgba(255, 255, 255, 0.2)',

                        // Căn chỉnh
                        textSize: '18px',
                    })}
                />
            </div>
            <p className="mt-4 text-lg font-semibold text-white">
                Đang xử lý...
            </p>
        </div>
    );
}