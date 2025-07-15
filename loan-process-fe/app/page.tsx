import { HeroSection } from "@/components/hero-section"
import { LoanForm } from "@/components/loan-form"
import { FeatureSection } from "@/components/feature-section"
import {Header} from "@/components/header/Header";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <HeroSection />
            <LoanForm />
            <FeatureSection />
        </div>
    )
}