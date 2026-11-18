import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { CategoriesSection } from '../components/home/CategoriesSection.jsx';
import { FaqSection } from '../components/home/FaqSection.jsx';
import { FeaturedSection } from '../components/home/FeaturedSection.jsx';
import { Hero } from '../components/home/Hero.jsx';
import { HomeCta } from '../components/home/HomeCta.jsx';
import { ReviewsSection } from '../components/home/ReviewsSection.jsx';
import { RitualFinder } from '../components/home/RitualFinder.jsx';
import { StorySection } from '../components/home/StorySection.jsx';
import { VisitSection } from '../components/home/VisitSection.jsx';

export default function Home() {
  useDocumentTitle('Nourish Your Natural Glow');

  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedSection />
      <RitualFinder />
      <StorySection />
      <ReviewsSection />
      <FaqSection />
      <VisitSection />
      <HomeCta />
    </>
  );
}
