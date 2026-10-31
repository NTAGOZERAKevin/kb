import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { CategoriesSection } from '../components/home/CategoriesSection.jsx';
import { FeaturedSection } from '../components/home/FeaturedSection.jsx';
import { Hero } from '../components/home/Hero.jsx';
import { HomeCta } from '../components/home/HomeCta.jsx';
import { ReviewsSection } from '../components/home/ReviewsSection.jsx';
import { StorySection } from '../components/home/StorySection.jsx';

export default function Home() {
  useDocumentTitle('Nourish Your Natural Glow');

  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedSection />
      <StorySection />
      <ReviewsSection />
      <HomeCta />
    </>
  );
}
