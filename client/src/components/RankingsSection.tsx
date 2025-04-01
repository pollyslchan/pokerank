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
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-6">Top Rankings</h3>
          
          {isLoadingRankings ? (
            <div className="flex justify-center items-center py-16">
              <div className="loader w-12 h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
            </div>
          ) : topRankings && topRankings.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left table-auto font-roboto">
                  <thead>
                    <tr className="bg-light-gray">
                      <th className="px-4 py-2 rounded-tl-lg">Rank</th>
                      <th className="px-4 py-2">Pokémon</th>
                      <th className="px-4 py-2">Rating</th>
                      <th className="px-4 py-2 rounded-tr-lg">W/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRankings.map((pokemon) => (
                      <tr key={pokemon.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold">{pokemon.rank}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <img 
                              src={pokemon.imageUrl.replace('/revision/latest', '')} 
                              alt={pokemon.name} 
                              className="w-10 h-10 mr-3 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";
                              }}
                            />
                            <span>{pokemon.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{pokemon.rating}</td>
                        <td className="px-4 py-3">{pokemon.wins}-{pokemon.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 text-center">
                <Link href="/rankings">
                  <Button className="px-6 py-2 bg-pokemon-blue hover:bg-blue-700 text-white font-medium rounded-lg transition">
                    View Full Rankings
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No rankings available yet. Start voting to see rankings!</p>
            </div>
          )}
        </div>
        
        {/* Recent Votes */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-6" id="history">Recent Votes</h3>
          
          {isLoadingVotes ? (
            <div className="flex justify-center items-center py-16">
              <div className="loader w-12 h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
            </div>
          ) : recentVotes && recentVotes.length > 0 ? (
            <div className="space-y-4">
              {recentVotes.map((vote) => (
                <div key={vote.id} className="flex items-center p-3 border-b border-gray-200">
                  <div className="flex-shrink-0 w-12 h-12 mr-3">
                    <img 
                      src={vote.winner.imageUrl.replace('/revision/latest', '')} 
                      alt={vote.winner.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">{vote.winner.name}</span>
                        <span className="text-win"> won against </span>
                      </div>
                      <span className="text-xs text-gray-500">{vote.timeAgo}</span>
                    </div>
                    <div className="flex">
                      <span>{vote.loser.name}</span>
                      <div className="ml-2 flex items-center text-xs">
                        <span className="text-gray-500">(Rating: +{vote.winnerRatingDelta})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No votes have been recorded yet. Start voting!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
