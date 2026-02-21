import HeroSection from './HeroSection'
import LogoCloud from './LogoCloud'
import Features from './Features'
import Integrations from './Integrations'
import Stats from './Stats'
import CallToAction from './CallToAction'

export default function HeroPage() {
    return (
        <div className="bg-background">
            <HeroSection />
            <LogoCloud />
            <Features />
            <Integrations />
            <Stats />
            <CallToAction />
        </div>
    )
}
