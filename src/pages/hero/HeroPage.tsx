import HeroSection from './HeroSection'
import Features from './Features'
import Integrations from './Integrations'
import Stats from './Stats'
import CallToAction from './CallToAction'

export default function HeroPage() {
    return (
        <div className="bg-background min-h-screen">
            <HeroSection />
            <Features />
            <Integrations />
            <Stats />
            <CallToAction />
        </div>
    )
}
