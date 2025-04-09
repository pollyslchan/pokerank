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
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

  const handleVote = () => {
    if (!isLoading && voteStatus === "idle") {
      onVote(pokemon.id);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isLoading && voteStatus === "idle") {
      const swipeThreshold = 50;
      const swipeDistance = touchStart - touchEnd;
      
      if (Math.abs(swipeDistance) > swipeThreshold) {
        // Swipe left or right triggers vote
        onVote(pokemon.id);
      }
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="pokemon-card ultraball-card flex-1 w-full max-w-xs flex flex-col hover-scale overflow-hidden cursor-pointer"
      onClick={handleVote}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative z-10">
        <img 
          src={pokemon.imageUrl} 
          alt={pokemon.name} 
          className="w-full h-36 sm:h-44 md:h-52 object-contain p-2 sm:p-4 transition-transform duration-300 hover:scale-110 animate-float z-10" 
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png";
          }}
        />
        <span className="absolute top-2 left-2 bg-ultraball-black text-ultraball-yellow text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full border-2 border-ultraball-yellow z-20">
          #{pokemon.pokedexNumber.toString().padStart(3, '0')}
        </span>
      </div>
      
      <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow relative z-10">
        <h4 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-center text-ultraball-black">{pokemon.name}</h4>
        
        <div className="flex justify-center flex-wrap gap-1 mb-1 sm:mb-2 md:mb-3">
          {pokemon.types.map((type, index) => (
            <span 
              key={index} 
              className={`px-2 py-0.5 text-[10px] sm:text-xs ${typeColors[type] || 'bg-gray-400'} text-white rounded-full shadow-md`}
            >
              {type}
            </span>
          ))}
        </div>
        
        <div className="text-center text-[10px] sm:text-xs md:text-sm text-gray-800 mb-1 sm:mb-2 md:mb-3 flex-grow bg-white/80 rounded-lg p-2 shadow-inner">
          <p>Current Rank: <span className="font-semibold">{pokemon.rank || 'N/A'}</span></p>
          <p>Rating: <span className="font-semibold">{pokemon.rating}</span></p>
          <p>Record: <span className="font-semibold">{pokemon.wins}-{pokemon.losses}</span></p>
        </div>
        
        <Button
          disabled={isLoading || voteStatus !== "idle"}
          className={`ultraball-button w-full py-2 sm:py-3 md:py-4 font-bold ${
            voteStatus === "voted" 
              ? "bg-ultraball-yellow text-ultraball-black" 
              : "bg-ultraball-black text-white hover:bg-ultraball-yellow hover:text-ultraball-black"
          } text-xs sm:text-sm md:text-base transform hover:-translate-y-1 transition-all duration-300 pointer-events-none`}
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
