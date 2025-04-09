import { useState, useEffect } from "react";
import { Pokemon } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  
  const handleVote = () => {
    if (!isLoading && voteStatus === "idle") {
      onVote(pokemon.id);
      
      // Animate card on vote
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.3 }
      });
    }
  };
  
  const handleDragStart = (_: any, info: PanInfo) => {
    setStartX(info.point.x);
    setIsDragging(true);
  };
  
  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (voteStatus !== "idle" || isLoading) return;
    
    const swipeThreshold = 100;
    const swipeDistance = info.offset.x;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      // User swiped far enough to count as a vote
      onVote(pokemon.id);
      
      // Animate card flying off screen
      controls.start({
        x: swipeDistance > 0 ? 500 : -500,
        opacity: 0,
        transition: { duration: 0.5 }
      }).then(() => {
        // Reset card position after animation
        controls.start({ x: 0, opacity: 1, transition: { duration: 0 } });
      });
    } else {
      // Reset position if not swiped enough
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      });
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    // Only register click if it's not after a drag
    if (!isDragging && voteStatus === "idle" && !isLoading) {
      handleVote();
    }
  };
  
  // Effect to reset the card position when getting a new Pokemon
  useEffect(() => {
    controls.start({ x: 0, opacity: 1 });
  }, [pokemon.id, controls]);
  
  // Get visual feedback for swipe direction
  const getSwipeIndicator = () => {
    const currentX = x.get();
    
    if (Math.abs(currentX) < 30) return null;
    
    const isRightSwipe = currentX > 0;
    
    return (
      <div className={`absolute inset-0 z-40 flex items-center justify-center bg-opacity-50 rounded-xl
        ${isRightSwipe ? 'bg-green-500' : 'bg-red-500'}`}>
        <div className="bg-white px-4 py-2 rounded-full font-bold shadow-lg">
          {isRightSwipe ? '👍 Vote!' : '👎 Skip'}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="pokemon-card ultraball-card flex-1 w-full max-w-xs flex flex-col hover-scale overflow-hidden cursor-pointer touch-manipulation select-none"
      animate={controls}
      drag={voteStatus === "idle" && !isLoading ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      style={{ x, rotate }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Swipe indicator overlay */}
      {isDragging && getSwipeIndicator()}
      
      <div className="relative z-10">
        <img 
          src={pokemon.imageUrl} 
          alt={pokemon.name} 
          className="w-full h-28 sm:h-36 md:h-44 object-contain p-2 sm:p-4 transition-transform duration-300 hover:scale-110 animate-float z-10" 
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
        <h4 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-center text-white">{pokemon.name}</h4>
        
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
        
        <div className="text-center text-[10px] sm:text-xs md:text-sm text-gray-800 mb-1 sm:mb-2 md:mb-3 flex-grow bg-white/80 rounded-lg p-1 sm:p-2 shadow-inner">
          <p>Current Rank: <span className="font-semibold">{pokemon.rank || 'N/A'}</span></p>
          <p>Rating: <span className="font-semibold">{pokemon.rating}</span></p>
          <p>Record: <span className="font-semibold">{pokemon.wins}-{pokemon.losses}</span></p>
        </div>
        
        <div className={`ultraball-button w-full py-2 sm:py-3 text-center font-bold rounded-full shadow-md
          ${voteStatus === "voted" 
            ? "bg-ultraball-yellow text-ultraball-black" 
            : "bg-ultraball-black text-white"
          } text-xs sm:text-sm transition-all duration-300`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin inline-block mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : voteStatus === "voting" ? (
            <>
              <svg className="animate-spin inline-block mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Voting...
            </>
          ) : voteStatus === "voted" ? (
            "Vote Recorded!"
          ) : (
            <>
              <span>{isMobile ? "Tap or Swipe" : "Click or Swipe"}</span>
              {!isMobile && <span className="ml-1">to Vote</span>}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
