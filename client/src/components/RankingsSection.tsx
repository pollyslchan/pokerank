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
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Top Rankings */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6">Top Rankings</h3>
          
          {isLoadingRankings ? (
            <div className="flex justify-center items-center py-8 sm:py-10 md:py-16">
              <div className="loader w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
            </div>
          ) : topRankings && topRankings.length > 0 ? (
            <>
              <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
                <table className="w-full text-left table-auto font-roboto text-xs sm:text-sm md:text-base">
                  <thead>
                    <tr className="bg-light-gray">
                      <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-tl-lg">#</th>
                      <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">Pokémon</th>
                      <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">Rating</th>
                      <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-tr-lg">W/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRankings.map((pokemon) => (
                      <tr key={pokemon.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 font-bold">{pokemon.rank}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3">
                          <div className="flex items-center">
                            <img 
                              src={pokemon.imageUrl.replace('/revision/latest', '')} 
                              alt={pokemon.name} 
                              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-1.5 sm:mr-2 md:mr-3 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";
                              }}
                            />
                            <span className="truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">{pokemon.name}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3">{pokemon.rating}</td>
                        <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3">{pokemon.wins}-{pokemon.losses}</td>
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
        <div className="flex-1 bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6" id="history">Recent Votes</h3>
          
          {isLoadingVotes ? (
            <div className="flex justify-center items-center py-8 sm:py-10 md:py-16">
              <div className="loader w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
            </div>
          ) : recentVotes && recentVotes.length > 0 ? (
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {recentVotes.map((vote) => (
                <div key={vote.id} className="flex items-center p-2 sm:p-3 border-b border-gray-200">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 mr-1.5 sm:mr-2 md:mr-3">
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
                      <div className="pr-1 sm:pr-2">
                        <span className="font-medium truncate inline-block text-xs sm:text-sm md:text-base">{vote.winner.name}</span>
                        <span className="text-win text-[10px] sm:text-xs md:text-sm"> won against </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-500 ml-auto">{vote.timeAgo}</span>
                    </div>
                    <div className="flex flex-wrap items-center">
                      <span className="text-[10px] sm:text-xs md:text-sm truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{vote.loser.name}</span>
                      <div className="ml-1 sm:ml-2 flex items-center text-[10px] sm:text-xs">
                        <span className="text-gray-500">(+{vote.winnerRatingDelta})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 sm:py-6 md:py-8">
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">No votes have been recorded yet. Start voting!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
