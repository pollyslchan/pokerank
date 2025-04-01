import { Pokemon } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface PokemonCardProps {
  pokemon: Pokemon & { rank?: number };
  onVote: (id: number) => void;
  isLoading: boolean;
  voteStatus: "idle" | "voting" | "voted";
}

// Type badge color mapping
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

export default function PokemonCard({ pokemon, onVote, isLoading, voteStatus }: PokemonCardProps) {
  const handleVote = () => {
    if (!isLoading && voteStatus === "idle") {
      onVote(pokemon.id);
    }
  };

  return (
    <div className="pokemon-card flex-1 bg-gradient-to-b from-white to-light-gray rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-xs flex flex-col border border-gray-100">
      <div className="relative">
        <img 
          src={pokemon.imageUrl} 
          alt={pokemon.name} 
          className="w-full h-32 sm:h-40 md:h-48 object-contain bg-white p-2 sm:p-4 transition-transform duration-300 hover:scale-110" 
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";
          }}
        />
        <span className="absolute top-2 left-2 bg-pokemon-blue text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full">
          #{pokemon.pokedexNumber.toString().padStart(3, '0')}
        </span>
      </div>
      
      <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow">
        <h4 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-center">{pokemon.name}</h4>
        
        <div className="flex justify-center flex-wrap gap-1 mb-1 sm:mb-2 md:mb-3">
          {pokemon.types.map((type, index) => (
            <span 
              key={index} 
              className={`px-2 py-0.5 text-[10px] sm:text-xs ${typeColors[type] || 'bg-gray-400'} text-white rounded-full`}
            >
              {type}
            </span>
          ))}
        </div>
        
        <div className="text-center text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1 sm:mb-2 md:mb-3 flex-grow">
          <p>Current Rank: <span className="font-semibold">{pokemon.rank || 'N/A'}</span></p>
          <p>Rating: <span className="font-semibold">{pokemon.rating}</span></p>
          <p>Record: <span className="font-semibold">{pokemon.wins}-{pokemon.losses}</span></p>
        </div>
        
        <Button
          onClick={handleVote}
          disabled={isLoading || voteStatus !== "idle"}
          className={`vote-button w-full py-2 sm:py-3 md:py-4 font-bold rounded-lg shadow-lg transition ${
            voteStatus === "voted" 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-pokemon-red hover:bg-red-700"
          } text-xs sm:text-sm md:text-base text-white border-2 border-transparent hover:border-white`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : voteStatus === "voting" ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Voting...
            </>
          ) : voteStatus === "voted" ? (
            "Vote Recorded!"
          ) : (
            "Vote for This Pokémon"
          )}
        </Button>
      </div>
    </div>
  );
}
