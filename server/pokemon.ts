import { InsertPokemon } from "@shared/schema";
import { pokemonTypesData } from "./pokemon-data";

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
    
    // Create entries for all Pokemon with reliable images and data from our static database
    for (const pokedexNumber of allPokemonNumbers) {
      // Use PokeAPI sprites which are reliable
      const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png`;
      
      // Get name and types from our static data if available
      let name = `Pokémon #${pokedexNumber}`;
      let types = ["Normal"];
      
      // If we have data for this Pokémon in our static database, use it
      if (pokemonTypesData[pokedexNumber]) {
        name = pokemonTypesData[pokedexNumber].name;
        types = pokemonTypesData[pokedexNumber].types;
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
    
    // Sort and return
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