import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import PlatformSection from "../components/landing/PlatformSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import FinalCTA from "../components/landing/FinalCTA";
import LandingFooter from "../components/landing/LandingFooter";

function Landing() {
    return (
        <div className="min-h-screen bg-bg-canvas font-body text-text-primary selection:bg-brand-500 selection:text-white">
            <LandingNavbar />
            <main>
                <HeroSection />
                <PlatformSection />
                <FeaturesSection />
                <FinalCTA />
            </main>
            <LandingFooter />
        </div>
    );
}

export default Landing;
