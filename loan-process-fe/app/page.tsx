import { HeroSection } from "@/components/hero-section"
import { LoanForm } from "@/components/loan-form"
import { FeatureSection } from "@/components/feature-section"

export default function HomePage() {
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <HeroSection />
      <LoanForm />
      <FeatureSection />
    </div>
  )
}
