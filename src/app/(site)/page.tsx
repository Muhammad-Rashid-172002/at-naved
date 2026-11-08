import { FoodCarousel3D } from "@/components/home/carousel-3d";
import { Hero, Marquee } from "@/components/home/hero";
import {
  CategoryStrip,
  ClosingCta,
  FoodShowcase,
  HowItWorks,
  LocationSection,
  OffersPreview,
  PopularItems,
  Reviews,
  WhyUs,
} from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <CategoryStrip />
      <PopularItems />
      <FoodShowcase />
      <OffersPreview />
      <FoodCarousel3D />
      <WhyUs />
      <HowItWorks />
      <Reviews />
      <LocationSection />
      <ClosingCta />
    </>
  );
}
