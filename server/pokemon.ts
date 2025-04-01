import { InsertPokemon } from "@shared/schema";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

/**
 * Fetches Pokemon data for database insertion
 * @returns Array of Pokemon data objects
 */
export async function fetchPokemonData(): Promise<InsertPokemon[]> {
  try {
    // Create base Pokemon collection with reliable images from PokeAPI
    const pokemonData: InsertPokemon[] = [];
    
    // For demo purposes, we'll limit to a reasonable number of Pokemon
    // Get Gen 1-9 starters and some other popular Pokemon
    const importantPokemonNumbers = [
      // Gen 1 starters and popular Pokemon
      1, 4, 7, 25, 150, 
      // Gen 2 starters
      152, 155, 158,
      // Gen 3 starters  
      252, 255, 258,
      // Gen 4 starters
      387, 390, 393,
      // Gen 5 starters
      495, 498, 501,
      // Gen 6 starters  
      650, 653, 656,
      // Gen 7 starters
      722, 725, 728,
      // Gen 8 starters
      810, 813, 816,
      // Gen 9 starters  
      906, 909, 912
    ];
    
    // Also include every 50th Pokemon to get a good distribution
    for (let i = 50; i <= 1000; i += 50) {
      if (!importantPokemonNumbers.includes(i)) {
        importantPokemonNumbers.push(i);
      }
    }
    
    console.log(`Creating base entries for ${importantPokemonNumbers.length} Pokémon...`);
    
    // Create entries for selected Pokemon with reliable images
    for (const pokedexNumber of importantPokemonNumbers) {
      // Use PokeAPI sprites which are reliable
      const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png`;
      
      // Default name/types until we can fetch the real ones
      const name = `Pokémon #${pokedexNumber}`;
      
      pokemonData.push({
        pokedexNumber,
        name,
        imageUrl,
        types: ["Normal"], 
        rating: 1500,
        wins: 0,
        losses: 0
      });
    }
    
    // Try to enhance with wiki data
    try {
      console.log("Enhancing Pokémon data from wiki...");
      const response = await fetch('https://pokemon.fandom.com/wiki/List_of_Pok%C3%A9mon');
      
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Create a map for easy lookup and updating
        const pokemonMap = new Map<number, InsertPokemon>();
        pokemonData.forEach(pokemon => {
          pokemonMap.set(pokemon.pokedexNumber, pokemon);
        });
        
        // Process wiki tables
        const tables = $('table.wikitable');
        console.log(`Found ${tables.length} Pokemon tables on the wiki page`);
        
        tables.each((_, tableElement) => {
          $(tableElement).find('tr').each((rowIndex, row) => {
            // Skip header row
            if (rowIndex === 0) return;
            
            const columns = $(row).find('td');
            if (columns.length < 2) return;
            
            try {
              // Extract Pokédex number
              const firstCell = $(columns[0]);
              const cellText = firstCell.text().trim();
              const pokedexNumberMatch = cellText.match(/(\d+)/);
              
              if (!pokedexNumberMatch) return;
              const pokedexNumber = parseInt(pokedexNumberMatch[1], 10);
              
              // Only process if we have this Pokemon in our map
              if (!pokemonMap.has(pokedexNumber)) return;
              
              // Get name from text or link
              let name = "";
              const nameMatch = cellText.match(/\d+\s+(.+)/);
              if (nameMatch) {
                name = nameMatch[1].trim();
              } else {
                const nameText = firstCell.find('a').first().text().trim();
                if (nameText && !nameText.match(/^\d+$/)) {
                  name = nameText;
                }
              }
              
              // Update name if found
              if (name) {
                const pokemon = pokemonMap.get(pokedexNumber);
                if (pokemon) {
                  pokemon.name = name;
                }
              }
              
              // Extract types
              const typeCell = $(columns[columns.length - 1]);
              let types: string[] = [];
              
              // First try to get types from images
              const typeImages = typeCell.find('img');
              if (typeImages.length > 0) {
                typeImages.each((_, img) => {
                  const typeFromAlt = $(img).attr('alt')?.replace(' type', '').trim();
                  if (typeFromAlt && !types.includes(typeFromAlt)) {
                    // Standardize type names
                    const standardizeType = (rawType: string): string => {
                      const standardTypes = [
                        "Normal", "Fire", "Water", "Grass", "Electric", "Ice", 
                        "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", 
                        "Rock", "Ghost", "Dark", "Dragon", "Steel", "Fairy"
                      ];
                      
                      // Exact match
                      const exactMatch = standardTypes.find(t => 
                        t.toLowerCase() === rawType.toLowerCase());
                      if (exactMatch) return exactMatch;
                      
                      // Partial match
                      const partialMatch = standardTypes.find(t => 
                        rawType.toLowerCase().includes(t.toLowerCase()));
                      if (partialMatch) return partialMatch;
                      
                      return rawType;
                    };
                    
                    types.push(standardizeType(typeFromAlt));
                  }
                });
              }
              
              // Then try text
              if (types.length === 0) {
                const typeText = typeCell.text().trim().split('/');
                typeText.forEach(type => {
                  const cleanType = type.trim();
                  if (cleanType && !["???", "N/A", "-"].includes(cleanType) && !types.includes(cleanType)) {
                    // Standardize type names
                    const standardTypes = [
                      "Normal", "Fire", "Water", "Grass", "Electric", "Ice", 
                      "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", 
                      "Rock", "Ghost", "Dark", "Dragon", "Steel", "Fairy"
                    ];
                    
                    // Try to find a standard type match
                    let matchedType = cleanType;
                    for (const standardType of standardTypes) {
                      if (cleanType.toLowerCase().includes(standardType.toLowerCase())) {
                        matchedType = standardType;
                        break;
                      }
                    }
                    
                    types.push(matchedType);
                  }
                });
              }
              
              // Update types if found
              if (types.length > 0) {
                const pokemon = pokemonMap.get(pokedexNumber);
                if (pokemon) {
                  pokemon.types = types;
                }
              }
            } catch (error) {
              console.error(`Error processing row: ${error}`);
            }
          });
        });
        
        // Ensure accurate data for key Pokemon
        const keyPokemon = [
          // Gen 1 starters and popular Pokemon
          { number: 1, name: "Bulbasaur", types: ["Grass", "Poison"] },
          { number: 4, name: "Charmander", types: ["Fire"] },
          { number: 7, name: "Squirtle", types: ["Water"] },
          { number: 25, name: "Pikachu", types: ["Electric"] },
          { number: 150, name: "Mewtwo", types: ["Psychic"] },
          { number: 151, name: "Mew", types: ["Psychic"] },
          
          // Gen 2 starters
          { number: 152, name: "Chikorita", types: ["Grass"] },
          { number: 155, name: "Cyndaquil", types: ["Fire"] },
          { number: 158, name: "Totodile", types: ["Water"] },
          
          // Gen 3 starters
          { number: 252, name: "Treecko", types: ["Grass"] },
          { number: 255, name: "Torchic", types: ["Fire"] },
          { number: 258, name: "Mudkip", types: ["Water"] },
          
          // Popular Pokemon from various generations
          { number: 6, name: "Charizard", types: ["Fire", "Flying"] },
          { number: 9, name: "Blastoise", types: ["Water"] },
          { number: 149, name: "Dragonite", types: ["Dragon", "Flying"] },
          { number: 196, name: "Espeon", types: ["Psychic"] },
          { number: 197, name: "Umbreon", types: ["Dark"] },
          { number: 200, name: "Misdreavus", types: ["Ghost"] },
          { number: 249, name: "Lugia", types: ["Psychic", "Flying"] },
          { number: 250, name: "Ho-Oh", types: ["Fire", "Flying"] }
        ];
        
        keyPokemon.forEach(({ number, name, types }) => {
          const pokemon = pokemonMap.get(number);
          if (pokemon) {
            // Update if still using default values
            if (pokemon.name === `Pokémon #${number}`) {
              pokemon.name = name;
            }
            if (pokemon.types.length === 1 && pokemon.types[0] === "Normal") {
              pokemon.types = types;
            }
          }
        });
        
        // Convert map back to array
        const enhancedPokemon = Array.from(pokemonMap.values());
        
        // Sort by Pokedex number
        enhancedPokemon.sort((a, b) => a.pokedexNumber - b.pokedexNumber);
        
        console.log(`Returning ${enhancedPokemon.length} enhanced Pokémon.`);
        return enhancedPokemon;
      }
    } catch (error) {
      console.error(`Error enhancing Pokémon data: ${error}`);
      // Continue with base dataset if enhancement fails
    }
    
    // Ensure key Pokemon have correct data
    const keyPokemon = [
      // Gen 1 starters and popular Pokemon
      { number: 1, name: "Bulbasaur", types: ["Grass", "Poison"] },
      { number: 4, name: "Charmander", types: ["Fire"] },
      { number: 7, name: "Squirtle", types: ["Water"] },
      { number: 25, name: "Pikachu", types: ["Electric"] },
      { number: 150, name: "Mewtwo", types: ["Psychic"] },
      { number: 151, name: "Mew", types: ["Psychic"] },
      
      // Gen 2 starters
      { number: 152, name: "Chikorita", types: ["Grass"] },
      { number: 155, name: "Cyndaquil", types: ["Fire"] },
      { number: 158, name: "Totodile", types: ["Water"] },
      
      // Gen 3 starters
      { number: 252, name: "Treecko", types: ["Grass"] },
      { number: 255, name: "Torchic", types: ["Fire"] },
      { number: 258, name: "Mudkip", types: ["Water"] },
      
      // Popular Pokemon from various generations
      { number: 6, name: "Charizard", types: ["Fire", "Flying"] },
      { number: 9, name: "Blastoise", types: ["Water"] },
      { number: 149, name: "Dragonite", types: ["Dragon", "Flying"] },
      { number: 196, name: "Espeon", types: ["Psychic"] },
      { number: 197, name: "Umbreon", types: ["Dark"] },
      { number: 200, name: "Misdreavus", types: ["Ghost"] },
      { number: 249, name: "Lugia", types: ["Psychic", "Flying"] },
      { number: 250, name: "Ho-Oh", types: ["Fire", "Flying"] }
    ];
    
    for (const pokemon of pokemonData) {
      const keyData = keyPokemon.find(kp => kp.number === pokemon.pokedexNumber);
      if (keyData) {
        pokemon.name = keyData.name;
        pokemon.types = keyData.types;
      }
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
