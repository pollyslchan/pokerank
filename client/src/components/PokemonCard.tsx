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
    <div className="pokemon-card flex-1 bg-light-gray rounded-lg overflow-hidden shadow-md max-w-xs">
      <div className="relative">
        <img 
          src={pokemon.imageUrl.replace('/revision/latest', '')} 
          alt={pokemon.name} 
          className="w-full h-48 object-contain bg-white p-4" 
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";
          }}
        />
        <span className="absolute top-2 left-2 bg-pokemon-blue text-white text-xs font-bold px-2 py-1 rounded-full">
          #{pokemon.pokedexNumber.toString().padStart(3, '0')}
        </span>
      </div>
      
      <div className="p-4">
        <h4 className="text-xl font-bold mb-2 text-center">{pokemon.name}</h4>
        
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {pokemon.types.map((type, index) => (
            <span 
              key={index} 
              className={`px-3 py-1 ${typeColors[type] || 'bg-gray-400'} text-white text-xs rounded-full`}
            >
              {type}
            </span>
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-600 mb-4">
          <p>Current Rank: <span className="font-semibold">{pokemon.rank || 'N/A'}</span></p>
          <p>Rating: <span className="font-semibold">{pokemon.rating}</span></p>
          <p>Record: <span className="font-semibold">{pokemon.wins}-{pokemon.losses}</span></p>
        </div>
        
        <Button
          onClick={handleVote}
          disabled={isLoading || voteStatus !== "idle"}
          className={`vote-button w-full py-6 font-bold rounded-lg shadow transition ${
            voteStatus === "voted" 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-pokemon-red hover:bg-red-700"
          }`}
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
