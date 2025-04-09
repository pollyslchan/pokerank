import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PokemonWithRank } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FullRankings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Show 50 Pokémon per page for better performance
  
  // Fetch all Pokemon for rankings, we pass a large limit
  const { data: allPokemon, isLoading } = useQuery<PokemonWithRank[]>({
    queryKey: ['/api/rankings', { limit: 1025 }],
    // Transform the URL to include the limit parameter
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`/api/rankings?limit=1025`);
      if (!res.ok) throw new Error("Failed to fetch rankings");
      return res.json();
    },
  });

  // Filter Pokemon based on search term
  const filteredPokemon = allPokemon 
    ? allPokemon.filter(
        pokemon => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  pokemon.pokedexNumber.toString().includes(searchTerm)
      )
    : [];
    
  // Calculate total pages
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
  
  // Get current page items
  const currentItems = filteredPokemon.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Full Rankings</h2>
        <Link href="/">
          <Button variant="outline" className="border-ultraball-gold text-ultraball-black hover:bg-ultraball-black hover:text-ultraball-gold">
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="ultraball-card p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h3 className="text-2xl font-bold mb-4 md:mb-0 text-ultraball-black">All Pokémon Rankings</h3>
          <div className="w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Search by name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="loader w-12 h-12 border-4 border-gray-300 border-t-4 rounded-full animate-spin"></div>
          </div>
        ) : filteredPokemon.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto font-roboto text-sm">
                <thead>
                  <tr className="bg-ultraball-black text-ultraball-gold">
                    <th className="px-4 py-2 rounded-tl-lg">Rank</th>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Pokémon</th>
                    <th className="px-4 py-2">Types</th>
                    <th className="px-4 py-2">Rating</th>
                    <th className="px-4 py-2 rounded-tr-lg">W/L</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((pokemon) => (
                    <tr key={pokemon.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">{pokemon.rank}</td>
                      <td className="px-4 py-3">#{pokemon.pokedexNumber.toString().padStart(3, '0')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <img 
                            src={pokemon.imageUrl} 
                            alt={pokemon.name} 
                            className="w-10 h-10 mr-3 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";
                            }}
                          />
                          <span>{pokemon.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {pokemon.types.map((type, index) => (
                            <span 
                              key={index} 
                              className={`px-2 py-1 text-white text-xs rounded-full ${getTypeColor(type)}`}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">{pokemon.rating}</td>
                      <td className="px-4 py-3">{pokemon.wins}-{pokemon.losses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPokemon.length)} of {filteredPokemon.length} Pokémon
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-ultraball-gold text-ultraball-black hover:bg-ultraball-black hover:text-ultraball-gold"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center px-2">
                    {/* Simple page number display */}
                    <span className="text-ultraball-black">Page {currentPage} of {totalPages}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="border-ultraball-gold text-ultraball-black hover:bg-ultraball-black hover:text-ultraball-gold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No Pokémon found matching "{searchTerm}"</p>
            <Button 
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="border-ultraball-gold text-ultraball-black hover:bg-ultraball-black hover:text-ultraball-gold"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

// Helper function to get color class for a Pokémon type
function getTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    "Normal": "bg-gray-400",
    "Fire": "bg-orange-500",
    "Water": "bg-blue-500",
    "Grass": "bg-green-500",
    "Electric": "bg-yellow-500",
    "Ice": "bg-cyan-400",
    "Fighting": "bg-red-700",
    "Poison": "bg-purple-500",
    "Ground": "bg-amber-700",
    "Flying": "bg-indigo-300",
    "Psychic": "bg-pink-500",
    "Bug": "bg-lime-500",
    "Rock": "bg-yellow-700",
    "Ghost": "bg-purple-700",
    "Dark": "bg-gray-700",
    "Dragon": "bg-indigo-600",
    "Steel": "bg-gray-500",
    "Fairy": "bg-pink-300",
  };
  
  return typeColors[type] || "bg-gray-400";
}
