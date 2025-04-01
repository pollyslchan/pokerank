import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PokemonWithRank, VoteWithPokemon } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function RankingsSection() {
  // Fetch top ranked Pokemon
  const { 
    data: topRankings, 
    isLoading: isLoadingRankings 
  } = useQuery<PokemonWithRank[]>({ 
    queryKey: ['/api/rankings'],
    retry: 3,
  });

  // Fetch recent votes
  const { 
    data: recentVotes, 
    isLoading: isLoadingVotes 
  } = useQuery<VoteWithPokemon[]>({ 
    queryKey: ['/api/votes/recent'],
    retry: 3,
  });

  return (
    <section id="rankings" className="mb-12">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Top Rankings */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Top Rankings</h3>
          
          {isLoadingRankings ? (
            <div className="flex justify-center items-center py-10 sm:py-16">
              <div className="loader w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
            </div>
          ) : topRankings && topRankings.length > 0 ? (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-left table-auto font-roboto text-sm sm:text-base">
                  <thead>
                    <tr className="bg-light-gray">
                      <th className="px-2 sm:px-4 py-2 rounded-tl-lg">Rank</th>
                      <th className="px-2 sm:px-4 py-2">Pokémon</th>
                      <th className="px-2 sm:px-4 py-2">Rating</th>
                      <th className="px-2 sm:px-4 py-2 rounded-tr-lg">W/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRankings.map((pokemon) => (
                      <tr key={pokemon.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold">{pokemon.rank}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center">
                            <img 
                              src={pokemon.imageUrl.replace('/revision/latest', '')} 
                              alt={pokemon.name} 
                              className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";
                              }}
                            />
                            <span className="truncate max-w-[80px] sm:max-w-none">{pokemon.name}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">{pokemon.rating}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">{pokemon.wins}-{pokemon.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 sm:mt-6 text-center">
                <Link href="/rankings">
                  <Button className="px-4 sm:px-6 py-1.5 sm:py-2 bg-pokemon-blue hover:bg-blue-700 text-white font-medium rounded-lg transition text-sm sm:text-base">
                    View Full Rankings
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-600">No rankings available yet. Start voting to see rankings!</p>
            </div>
          )}
        </div>
        
        {/* Recent Votes */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" id="history">Recent Votes</h3>
          
          {isLoadingVotes ? (
            <div className="flex justify-center items-center py-10 sm:py-16">
              <div className="loader w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
            </div>
          ) : recentVotes && recentVotes.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentVotes.map((vote) => (
                <div key={vote.id} className="flex items-center p-2 sm:p-3 border-b border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 mr-2 sm:mr-3">
                    <img 
                      src={vote.winner.imageUrl.replace('/revision/latest', '')} 
                      alt={vote.winner.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";
                      }}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start flex-wrap sm:flex-nowrap">
                      <div className="pr-2">
                        <span className="font-medium truncate inline-block">{vote.winner.name}</span>
                        <span className="text-win text-xs sm:text-sm"> won against </span>
                      </div>
                      <span className="text-xs text-gray-500 ml-auto">{vote.timeAgo}</span>
                    </div>
                    <div className="flex flex-wrap items-center">
                      <span className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{vote.loser.name}</span>
                      <div className="ml-1 sm:ml-2 flex items-center text-xs">
                        <span className="text-gray-500">(+{vote.winnerRatingDelta})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-600">No votes have been recorded yet. Start voting!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
