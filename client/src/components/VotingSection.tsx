import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Pokemon } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PokemonCard from "./PokemonCard";
import { Button } from "@/components/ui/button";

export default function VotingSection() {
  const { toast } = useToast();
  const [votedPokemonId, setVotedPokemonId] = useState<number | null>(null);

  // Fetch a random pair of Pokemon for voting
  const { 
    data: matchup, 
    isLoading: isLoadingMatchup,
    refetch: refetchMatchup 
  } = useQuery<{ pokemon1: Pokemon; pokemon2: Pokemon }>({ 
    queryKey: ['/api/matchup'],
    retry: 3,
  });

  // Handle vote submission
  const voteMutation = useMutation({
    mutationFn: async ({ winnerId, loserId }: { winnerId: number; loserId: number }) => {
      const res = await apiRequest('POST', '/api/vote', { winnerId, loserId });
      return res.json();
    },
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Vote recorded!",
        description: "Your vote has been recorded. New matchup loaded.",
      });

      // Reset voted state and load a new matchup after a short delay
      setTimeout(() => {
        setVotedPokemonId(null);
        queryClient.invalidateQueries({ queryKey: ['/api/matchup'] });
        queryClient.invalidateQueries({ queryKey: ['/api/rankings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/votes/recent'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      }, 1500);
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Failed to record vote",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });

      // Reset voted state
      setVotedPokemonId(null);
    }
  });

  // Handle vote button click
  const handleVote = (pokemonId: number) => {
    if (!matchup) return;

    setVotedPokemonId(pokemonId);

    const winnerId = pokemonId;
    const loserId = pokemonId === matchup.pokemon1.id ? matchup.pokemon2.id : matchup.pokemon1.id;

    voteMutation.mutate({ winnerId, loserId });
  };

  // Handle skip button click
  const handleSkip = () => {
    refetchMatchup();
  };

  // Loading state
  if (isLoadingMatchup && !matchup) {
    return (
      <section id="voting" className="mb-12">
        <div className="ultraball-card p-6 mb-8 overflow-visible relative">
          <h3 className="text-2xl font-bold mb-6 text-center text-ultraball-black relative">
            <span className="relative inline-block">
              Current Matchup
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-ultraball-yellow"></span>
            </span>
          </h3>
          <div className="flex justify-center items-center py-16 relative z-10">
            <div className="relative text-center">
              <div className="relative inline-block">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png" 
                  alt="Loading" 
                  className="w-16 h-16 animate-bounce-slow animate-rotate" 
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-ultraball-yellow rounded-full flex items-center justify-center border-2 border-ultraball-black animate-pulse">
                  <span className="text-ultraball-black font-bold text-xs">VS</span>
                </div>
              </div>
              <p className="text-ultraball-black font-semibold mt-6 text-center">Loading your next Pokémon matchup...</p>
              <div className="mt-4 bg-ultraball-black h-1 w-32 mx-auto rounded-full overflow-hidden">
                <div className="h-full bg-ultraball-yellow animate-pulse" style={{width: '50%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Get vote status for each Pokemon
  const getPokemonVoteStatus = (pokemonId: number) => {
    if (voteMutation.isPending && votedPokemonId === pokemonId) {
      return "voting";
    } else if (voteMutation.isSuccess && votedPokemonId === pokemonId) {
      return "voted";
    }
    return "idle";
  };

  return (
    <section id="voting" className="mb-12">
      <div className="ultraball-card p-6 mb-8 overflow-visible relative">
        <h3 className="text-2xl font-bold mb-6 text-center text-ultraball-black relative">
          <span className="relative inline-block">
            Current Matchup
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-ultraball-yellow"></span>
          </span>
        </h3>

        {matchup ? (
          <>
            {/* Matchup Container */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-4 items-center justify-center w-full max-w-5xl mx-auto relative z-10">
              {/* Left Pokemon */}
              <div className="w-full sm:w-[45%] max-w-[220px] sm:max-w-[250px]">
                <PokemonCard 
                  pokemon={matchup.pokemon1}
                  onVote={handleVote}
                  isLoading={isLoadingMatchup}
                  voteStatus={getPokemonVoteStatus(matchup.pokemon1.id)}
                />
              </div>

              {/* VS Divider */}
              <div className="flex flex-row sm:flex-col items-center justify-center order-first sm:order-none mb-0 sm:mb-0 z-20">
                <div className="bg-ultraball-black text-ultraball-yellow font-bold text-lg sm:text-2xl w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-ultraball-yellow animate-pulse">VS</div>
                <div className="text-ultraball-black text-xs sm:text-sm ml-2 sm:ml-0 sm:mt-2 font-bold bg-white px-3 py-1 rounded-full shadow-md border border-ultraball-yellow">
                  <span className="hidden sm:inline">Choose One</span>
                  <span className="sm:hidden">Swipe to Vote</span>
                </div>
              </div>

              {/* Right Pokemon */}
              <div className="w-full sm:w-[45%] max-w-[220px] sm:max-w-[250px]">
                <PokemonCard 
                  pokemon={matchup.pokemon2}
                  onVote={handleVote}
                  isLoading={isLoadingMatchup}
                  voteStatus={getPokemonVoteStatus(matchup.pokemon2.id)}
                />
              </div>
            </div>

            {/* Skip Button */}
            <div className="text-center mt-8">
              <Button
                onClick={handleSkip}
                disabled={voteMutation.isPending || isLoadingMatchup}
                className={`ultraball-button px-6 py-3 font-semibold transition-all duration-300 ${
                  voteMutation.isPending || isLoadingMatchup 
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-ultraball-yellow hover:text-ultraball-black"
                }`}
              >
                {isLoadingMatchup ? (
                  <>
                    <svg className="animate-spin inline-block mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Next Matchup"
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 inline-block max-w-sm">
              <p className="text-red-700 font-medium">Could not load a matchup. Please try again.</p>
            </div>
            <div>
              <Button
                onClick={() => refetchMatchup()}
                className="ultraball-button"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}