import './about.css';
import ScrollExpansionHero from './ScrollExpansionHero';
import OceanInfoSlides from './OceanInfoSlides';

const bgVideoSrc = '/assets/ocean-boat.mp4';
const scrollVideoSrc = '/assets/holiday-hosting.mp4';

interface AboutPageProps {
  isActive: boolean;
}

export default function AboutPage({ isActive }: AboutPageProps) {
  return (
    <ScrollExpansionHero
      isActive={isActive}
      mediaSrc={scrollVideoSrc}
      bgImageSrc={bgVideoSrc}
      title="Ocean Embed"
      eyebrow="Smart India Hackathon 2026"
      headerNote="MoES × INCOIS · North Indian Ocean"
     
    >
      <OceanInfoSlides />
    </ScrollExpansionHero>
  );
}
