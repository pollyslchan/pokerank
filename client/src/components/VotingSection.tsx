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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Current Matchup</h3>
          <div className="flex justify-center items-center py-16">
            <div className="loader w-12 h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
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
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-bold mb-6 text-center">Current Matchup</h3>
        
        {matchup ? (
          <>
            {/* Matchup Container */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              {/* Left Pokemon */}
              <PokemonCard 
                pokemon={matchup.pokemon1}
                onVote={handleVote}
                isLoading={isLoadingMatchup}
                voteStatus={getPokemonVoteStatus(matchup.pokemon1.id)}
              />
              
              {/* VS Divider */}
              <div className="flex flex-col items-center mx-4 my-2">
                <div className="bg-pokemon-yellow text-dark-gray font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center shadow-md">VS</div>
                <div className="text-gray-500 text-sm mt-2">Choose One</div>
              </div>
              
              {/* Right Pokemon */}
              <PokemonCard 
                pokemon={matchup.pokemon2}
                onVote={handleVote}
                isLoading={isLoadingMatchup}
                voteStatus={getPokemonVoteStatus(matchup.pokemon2.id)}
              />
            </div>

            {/* Skip Button */}
            <div className="text-center mt-6">
              <Button
                onClick={handleSkip}
                disabled={voteMutation.isPending || isLoadingMatchup}
                variant="outline"
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
              >
                {isLoadingMatchup ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Skip This Matchup"
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Could not load a matchup. Please try again later.</p>
            <Button
              onClick={refetchMatchup}
              className="mt-4 bg-pokemon-red hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
