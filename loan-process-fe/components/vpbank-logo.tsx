import Image from 'next/image';
import VpLogo from '../public/images.jpeg'
export function VpbankLogo({ className }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <Image
                src={VpLogo}
                alt="VPBank Logo"
                style={{ objectFit: 'contain' }}
                priority
                width={40}
                height={40}
            />
        </div>
    );
}