import { Hero } from "@/components/home/hero";
import { ProblemCategories } from "@/components/home/problem-categories";
import { ProblemFinderSection } from "@/components/home/problem-finder-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { FeaturedSolutions } from "@/components/home/featured-solutions";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemCategories />
      <ProblemFinderSection />
      <HowItWorks />
      <FeaturedSolutions />
    </>
  );
}
