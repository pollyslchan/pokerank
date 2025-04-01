import VotingSection from "@/components/VotingSection";
import RankingsSection from "@/components/RankingsSection";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/components/AboutSection";

export default function Home() {
  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pokemon-red via-pokemon-yellow to-pokemon-blue bg-clip-text text-transparent animate-gradient">Who's the Best Pokémon?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Vote in head-to-head matchups to help determine the ultimate ranking of all Pokémon. Your votes matter!
        </p>
        <div className="hidden md:block w-full max-w-xl mx-auto h-1 bg-gradient-to-r from-pokemon-red via-pokemon-yellow to-pokemon-blue rounded-full"></div>
      </section>
      
      {/* Main Sections */}
      <VotingSection />
      <RankingsSection />
      <StatsSection />
      <AboutSection />
    </main>
  );
}
