import { InsertPokemon } from "@shared/schema";
import fetch from "node-fetch";

interface PokeApiResponse {
  id: number;
  name: string;
  types: {
    slot: number;
    type: {
      name: string;
    }
  }[];
}

/**
 * Fetches Pokemon data from PokeAPI for a specific Pokémon number
 * @param pokedexNumber The Pokémon's national dex number
 * @returns Promise with the Pokémon data or null if there was an error
 */
async function fetchPokemonFromApi(pokedexNumber: number): Promise<{name: string, types: string[]} | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexNumber}`);
    if (!response.ok) {
      console.error(`Error fetching Pokémon #${pokedexNumber}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json() as PokeApiResponse;
    
    // Format the Pokémon name (capitalize first letter)
    const name = data.name.split('-')[0]; // Remove form names
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Extract and format types
    const types = data.types.map(t => {
      const typeName = t.type.name;
      return typeName.charAt(0).toUpperCase() + typeName.slice(1);
    });
    
    return {
      name: formattedName,
      types
    };
  } catch (error) {
    console.error(`Error fetching Pokémon #${pokedexNumber} from API:`, error);
    return null;
  }
}

/**
 * Fetches Pokemon data for database insertion
 * @returns Array of Pokemon data objects
 */
export async function fetchPokemonData(): Promise<InsertPokemon[]> {
  try {
    // Create base Pokemon collection with reliable images from PokeAPI
    const pokemonData: InsertPokemon[] = [];
    
    // Create a list of all Pokémon numbers from 1 to 1025
    const allPokemonNumbers: number[] = [];
    for (let i = 1; i <= 1025; i++) {
      allPokemonNumbers.push(i);
    }
    
    console.log(`Creating base entries for ${allPokemonNumbers.length} Pokémon...`);
    
    // Create entries for all Pokemon with reliable images
    for (const pokedexNumber of allPokemonNumbers) {
      // Use PokeAPI sprites which are reliable
      const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png`;
      
      // Default name/types
      let name = `Pokémon #${pokedexNumber}`;
      let types: string[] = ["Normal"];
      
      // Only fetch the first 20 Pokémon from the API to speed up initialization
      // We'll add predefined names and types for important ones later
      if (pokedexNumber <= 20) {
        // Try to get accurate data from PokeAPI
        const apiData = await fetchPokemonFromApi(pokedexNumber);
        if (apiData) {
          name = apiData.name;
          types = apiData.types;
        }
      }
      
      // Hard-coded corrections for important Pokémon
      if (pokedexNumber === 1) { // Bulbasaur
        name = "Bulbasaur";
        types = ["Grass", "Poison"];
      }
      else if (pokedexNumber === 2) { // Ivysaur
        name = "Ivysaur";
        types = ["Grass", "Poison"];
      }
      else if (pokedexNumber === 3) { // Venusaur
        name = "Venusaur";
        types = ["Grass", "Poison"];
      }
      else if (pokedexNumber === 4) { // Charmander
        name = "Charmander";
        types = ["Fire"];
      }
      else if (pokedexNumber === 5) { // Charmeleon
        name = "Charmeleon";
        types = ["Fire"];
      }
      else if (pokedexNumber === 6) { // Charizard
        name = "Charizard";
        types = ["Fire", "Flying"];
      }
      else if (pokedexNumber === 7) { // Squirtle
        name = "Squirtle";
        types = ["Water"];
      }
      else if (pokedexNumber === 8) { // Wartortle
        name = "Wartortle";
        types = ["Water"];
      }
      else if (pokedexNumber === 9) { // Blastoise
        name = "Blastoise";
        types = ["Water"];
      }
      else if (pokedexNumber === 10) { // Caterpie
        name = "Caterpie";
        types = ["Bug"];
      }
      else if (pokedexNumber === 11) { // Metapod
        name = "Metapod";
        types = ["Bug"];
      }
      else if (pokedexNumber === 12) { // Butterfree
        name = "Butterfree";
        types = ["Bug", "Flying"];
      }
      else if (pokedexNumber === 13) { // Weedle
        name = "Weedle";
        types = ["Bug", "Poison"];
      }
      else if (pokedexNumber === 14) { // Kakuna
        name = "Kakuna";
        types = ["Bug", "Poison"];
      }
      else if (pokedexNumber === 15) { // Beedrill
        name = "Beedrill";
        types = ["Bug", "Poison"];
      }
      else if (pokedexNumber === 16) { // Pidgey
        name = "Pidgey";
        types = ["Normal", "Flying"];
      }
      else if (pokedexNumber === 17) { // Pidgeotto
        name = "Pidgeotto";
        types = ["Normal", "Flying"];
      }
      else if (pokedexNumber === 18) { // Pidgeot
        name = "Pidgeot";
        types = ["Normal", "Flying"];
      }
      else if (pokedexNumber === 19) { // Rattata
        name = "Rattata";
        types = ["Normal"];
      }
      else if (pokedexNumber === 20) { // Raticate
        name = "Raticate";
        types = ["Normal"];
      }
      else if (pokedexNumber === 25) { // Pikachu
        name = "Pikachu";
        types = ["Electric"];
      }
      else if (pokedexNumber === 26) { // Raichu
        name = "Raichu";
        types = ["Electric"];
      }
      else if (pokedexNumber === 150) { // Mewtwo
        name = "Mewtwo";
        types = ["Psychic"];
      }
      else if (pokedexNumber === 151) { // Mew
        name = "Mew";
        types = ["Psychic"];
      }
      
      pokemonData.push({
        pokedexNumber,
        name,
        imageUrl,
        types,
        rating: 1500,
        wins: 0,
        losses: 0
      });
    }
    
    // Sort by Pokedex number
    pokemonData.sort((a, b) => a.pokedexNumber - b.pokedexNumber);
    
    console.log(`Returning ${pokemonData.length} Pokémon.`);
    return pokemonData;
    
  } catch (error) {
    console.error(`Failed to create Pokémon data: ${error}`);
    
    // Return fallback set with at least the starter Pokemon
    const fallbackPokemon: InsertPokemon[] = [
      {
        pokedexNumber: 1,
        name: "Bulbasaur",
        imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
        types: ["Grass", "Poison"],
        rating: 1500,
        wins: 0,
        losses: 0
      },
      {
        pokedexNumber: 4,
        name: "Charmander",
        imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
        types: ["Fire"],
        rating: 1500,
        wins: 0,
        losses: 0
      },
      {
        pokedexNumber: 7,
        name: "Squirtle",
        imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
        types: ["Water"],
        rating: 1500,
        wins: 0,
        losses: 0
      },
      {
        pokedexNumber: 25,
        name: "Pikachu",
        imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
        types: ["Electric"],
        rating: 1500,
        wins: 0,
        losses: 0
      }
    ];
    console.log("Using fallback Pokemon data due to errors.");
    return fallbackPokemon;
  }
}

/**
 * Calculates new ELO ratings for a pair of Pokémon after a match
 * 
 * @param winnerRating Current rating of the winner
 * @param loserRating Current rating of the loser
 * @param k K-factor, determines the maximum rating change (default: 32)
 * @returns Object with new ratings and rating changes
 */
export function calculateEloRating(
  winnerRating: number,
  loserRating: number,
  k: number = 32
): { 
  newWinnerRating: number;
  newLoserRating: number;
  winnerRatingDelta: number;
  loserRatingDelta: number;
} {
  // Calculate expected outcome using the ELO formula
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
  
  // Calculate rating changes
  const winnerRatingDelta = Math.round(k * (1 - expectedWinner));
  const loserRatingDelta = Math.round(k * (0 - expectedLoser));
  
  return {
    newWinnerRating: winnerRating + winnerRatingDelta,
    newLoserRating: loserRating + loserRatingDelta,
    winnerRatingDelta,
    loserRatingDelta
  };
}