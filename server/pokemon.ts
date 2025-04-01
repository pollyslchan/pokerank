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
              
              // Skip trying to extract types as this is unreliable
              // We'll use our predefined types later
            } catch (error) {
              console.error(`Error processing row: ${error}`);
            }
          });
        });
        
        // Ensure accurate data for key Pokemon
        const keyPokemon = [
          // Gen 1 starters and popular Pokemon
          { number: 1, name: "Bulbasaur", types: ["Grass", "Poison"] },
          { number: 2, name: "Ivysaur", types: ["Grass", "Poison"] },
          { number: 3, name: "Venusaur", types: ["Grass", "Poison"] },
          { number: 4, name: "Charmander", types: ["Fire"] },
          { number: 5, name: "Charmeleon", types: ["Fire"] },
          { number: 6, name: "Charizard", types: ["Fire", "Flying"] },
          { number: 7, name: "Squirtle", types: ["Water"] },
          { number: 8, name: "Wartortle", types: ["Water"] },
          { number: 9, name: "Blastoise", types: ["Water"] },
          { number: 25, name: "Pikachu", types: ["Electric"] },
          { number: 26, name: "Raichu", types: ["Electric"] },
          { number: 50, name: "Diglett", types: ["Ground"] },
          { number: 100, name: "Voltorb", types: ["Electric"] },
          { number: 133, name: "Eevee", types: ["Normal"] },
          { number: 134, name: "Vaporeon", types: ["Water"] },
          { number: 135, name: "Jolteon", types: ["Electric"] },
          { number: 136, name: "Flareon", types: ["Fire"] },
          { number: 143, name: "Snorlax", types: ["Normal"] },
          { number: 144, name: "Articuno", types: ["Ice", "Flying"] },
          { number: 145, name: "Zapdos", types: ["Electric", "Flying"] },
          { number: 146, name: "Moltres", types: ["Fire", "Flying"] },
          { number: 149, name: "Dragonite", types: ["Dragon", "Flying"] },
          { number: 150, name: "Mewtwo", types: ["Psychic"] },
          { number: 151, name: "Mew", types: ["Psychic"] },
          
          // Gen 2 starters and popular Pokemon
          { number: 152, name: "Chikorita", types: ["Grass"] },
          { number: 155, name: "Cyndaquil", types: ["Fire"] },
          { number: 158, name: "Totodile", types: ["Water"] },
          { number: 196, name: "Espeon", types: ["Psychic"] },
          { number: 197, name: "Umbreon", types: ["Dark"] },
          { number: 200, name: "Misdreavus", types: ["Ghost"] },
          { number: 243, name: "Raikou", types: ["Electric"] },
          { number: 244, name: "Entei", types: ["Fire"] },
          { number: 245, name: "Suicune", types: ["Water"] },
          { number: 249, name: "Lugia", types: ["Psychic", "Flying"] },
          { number: 250, name: "Ho-Oh", types: ["Fire", "Flying"] },
          
          // Gen 3 starters and popular Pokemon
          { number: 252, name: "Treecko", types: ["Grass"] },
          { number: 255, name: "Torchic", types: ["Fire"] },
          { number: 258, name: "Mudkip", types: ["Water"] },
          { number: 300, name: "Skitty", types: ["Normal"] },
          { number: 350, name: "Milotic", types: ["Water"] },
          { number: 384, name: "Rayquaza", types: ["Dragon", "Flying"] },
          
          // Add entries for Pokémon at multiples of 50 (not already covered)
          { number: 150, name: "Mewtwo", types: ["Psychic"] },
          { number: 200, name: "Misdreavus", types: ["Ghost"] },
          { number: 250, name: "Ho-Oh", types: ["Fire", "Flying"] },
          { number: 350, name: "Milotic", types: ["Water"] },
          { number: 400, name: "Bibarel", types: ["Normal", "Water"] },
          { number: 450, name: "Hippowdon", types: ["Ground"] },
          { number: 550, name: "Basculin", types: ["Water"] },
          { number: 600, name: "Klinklang", types: ["Steel"] },
          { number: 650, name: "Chespin", types: ["Grass"] },
          { number: 700, name: "Sylveon", types: ["Fairy"] },
          { number: 750, name: "Mudsdale", types: ["Ground"] },
          { number: 800, name: "Necrozma", types: ["Psychic"] },
          { number: 850, name: "Sizzlipede", types: ["Fire", "Bug"] },
          { number: 900, name: "Klawf", types: ["Rock"] },
          { number: 950, name: "Tatsugiri", types: ["Dragon", "Water"] },
          { number: 1000, name: "Gholdengo", types: ["Steel", "Ghost"] },
          
          // Gen 4 starters and popular Pokemon
          { number: 387, name: "Turtwig", types: ["Grass"] },
          { number: 390, name: "Chimchar", types: ["Fire"] },
          { number: 393, name: "Piplup", types: ["Water"] },
          { number: 450, name: "Hippowdon", types: ["Ground"] },
          { number: 470, name: "Leafeon", types: ["Grass"] },
          { number: 471, name: "Glaceon", types: ["Ice"] },
          
          // Gen 5+ starters
          { number: 495, name: "Snivy", types: ["Grass"] },
          { number: 498, name: "Tepig", types: ["Fire"] },
          { number: 500, name: "Emboar", types: ["Fire", "Fighting"] },
          { number: 501, name: "Oshawott", types: ["Water"] },
          { number: 650, name: "Chespin", types: ["Grass"] },
          { number: 653, name: "Fennekin", types: ["Fire"] },
          { number: 656, name: "Froakie", types: ["Water"] },
          { number: 700, name: "Sylveon", types: ["Fairy"] },
          { number: 722, name: "Rowlet", types: ["Grass", "Flying"] },
          { number: 725, name: "Litten", types: ["Fire"] },
          { number: 728, name: "Popplio", types: ["Water"] },
          { number: 810, name: "Grookey", types: ["Grass"] },
          { number: 813, name: "Scorbunny", types: ["Fire"] },
          { number: 816, name: "Sobble", types: ["Water"] },
          { number: 906, name: "Sprigatito", types: ["Grass"] },
          { number: 909, name: "Fuecoco", types: ["Fire"] },
          { number: 912, name: "Quaxly", types: ["Water"] }
        ];
        
        keyPokemon.forEach(({ number, name, types }) => {
          const pokemon = pokemonMap.get(number);
          if (pokemon) {
            // Always use our predefined values
            pokemon.name = name;
            pokemon.types = types;
          }
        });
        
        // Convert map back to array
        const enhancedPokemon = Array.from(pokemonMap.values());
        
        // Sort by Pokedex number
        enhancedPokemon.sort((a, b) => a.pokedexNumber - b.pokedexNumber);
        
        // Apply our key Pokemon data one more time to ensure accuracy
        // This time we'll forcefully overwrite any data with our key Pokemon data
        for (const pokemon of enhancedPokemon) {
          const keyData = keyPokemon.find(kp => kp.number === pokemon.pokedexNumber);
          if (keyData) {
            pokemon.name = keyData.name;
            pokemon.types = keyData.types;
          }
        }
        
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
      { number: 2, name: "Ivysaur", types: ["Grass", "Poison"] },
      { number: 3, name: "Venusaur", types: ["Grass", "Poison"] },
      { number: 4, name: "Charmander", types: ["Fire"] },
      { number: 5, name: "Charmeleon", types: ["Fire"] },
      { number: 6, name: "Charizard", types: ["Fire", "Flying"] },
      { number: 7, name: "Squirtle", types: ["Water"] },
      { number: 8, name: "Wartortle", types: ["Water"] },
      { number: 9, name: "Blastoise", types: ["Water"] },
      { number: 25, name: "Pikachu", types: ["Electric"] },
      { number: 26, name: "Raichu", types: ["Electric"] },
      { number: 50, name: "Diglett", types: ["Ground"] },
      { number: 100, name: "Voltorb", types: ["Electric"] },
      { number: 133, name: "Eevee", types: ["Normal"] },
      { number: 134, name: "Vaporeon", types: ["Water"] },
      { number: 135, name: "Jolteon", types: ["Electric"] },
      { number: 136, name: "Flareon", types: ["Fire"] },
      { number: 143, name: "Snorlax", types: ["Normal"] },
      { number: 144, name: "Articuno", types: ["Ice", "Flying"] },
      { number: 145, name: "Zapdos", types: ["Electric", "Flying"] },
      { number: 146, name: "Moltres", types: ["Fire", "Flying"] },
      { number: 149, name: "Dragonite", types: ["Dragon", "Flying"] },
      { number: 150, name: "Mewtwo", types: ["Psychic"] },
      { number: 151, name: "Mew", types: ["Psychic"] },
      
      // Gen 2 starters and popular Pokemon
      { number: 152, name: "Chikorita", types: ["Grass"] },
      { number: 155, name: "Cyndaquil", types: ["Fire"] },
      { number: 158, name: "Totodile", types: ["Water"] },
      { number: 196, name: "Espeon", types: ["Psychic"] },
      { number: 197, name: "Umbreon", types: ["Dark"] },
      { number: 200, name: "Misdreavus", types: ["Ghost"] },
      { number: 243, name: "Raikou", types: ["Electric"] },
      { number: 244, name: "Entei", types: ["Fire"] },
      { number: 245, name: "Suicune", types: ["Water"] },
      { number: 249, name: "Lugia", types: ["Psychic", "Flying"] },
      { number: 250, name: "Ho-Oh", types: ["Fire", "Flying"] },
      
      // Gen 3 starters and popular Pokemon
      { number: 252, name: "Treecko", types: ["Grass"] },
      { number: 255, name: "Torchic", types: ["Fire"] },
      { number: 258, name: "Mudkip", types: ["Water"] },
      { number: 300, name: "Skitty", types: ["Normal"] },
      { number: 350, name: "Milotic", types: ["Water"] },
      { number: 384, name: "Rayquaza", types: ["Dragon", "Flying"] },
      
      // Add entries for Pokémon at multiples of 50 (not already covered)
      { number: 150, name: "Mewtwo", types: ["Psychic"] },
      { number: 200, name: "Misdreavus", types: ["Ghost"] },
      { number: 250, name: "Ho-Oh", types: ["Fire", "Flying"] },
      { number: 350, name: "Milotic", types: ["Water"] },
      { number: 400, name: "Bibarel", types: ["Normal", "Water"] },
      { number: 450, name: "Hippowdon", types: ["Ground"] },
      { number: 550, name: "Basculin", types: ["Water"] },
      { number: 600, name: "Klinklang", types: ["Steel"] },
      { number: 650, name: "Chespin", types: ["Grass"] },
      { number: 700, name: "Sylveon", types: ["Fairy"] },
      { number: 750, name: "Mudsdale", types: ["Ground"] },
      { number: 800, name: "Necrozma", types: ["Psychic"] },
      { number: 850, name: "Sizzlipede", types: ["Fire", "Bug"] },
      { number: 900, name: "Klawf", types: ["Rock"] },
      { number: 950, name: "Tatsugiri", types: ["Dragon", "Water"] },
      { number: 1000, name: "Gholdengo", types: ["Steel", "Ghost"] },
      
      // Gen 4 starters and popular Pokemon
      { number: 387, name: "Turtwig", types: ["Grass"] },
      { number: 390, name: "Chimchar", types: ["Fire"] },
      { number: 393, name: "Piplup", types: ["Water"] },
      { number: 450, name: "Hippowdon", types: ["Ground"] },
      { number: 470, name: "Leafeon", types: ["Grass"] },
      { number: 471, name: "Glaceon", types: ["Ice"] },
      
      // Gen 5+ starters
      { number: 495, name: "Snivy", types: ["Grass"] },
      { number: 498, name: "Tepig", types: ["Fire"] },
      { number: 500, name: "Emboar", types: ["Fire", "Fighting"] },
      { number: 501, name: "Oshawott", types: ["Water"] },
      { number: 650, name: "Chespin", types: ["Grass"] },
      { number: 653, name: "Fennekin", types: ["Fire"] },
      { number: 656, name: "Froakie", types: ["Water"] },
      { number: 700, name: "Sylveon", types: ["Fairy"] },
      { number: 722, name: "Rowlet", types: ["Grass", "Flying"] },
      { number: 725, name: "Litten", types: ["Fire"] },
      { number: 728, name: "Popplio", types: ["Water"] },
      { number: 810, name: "Grookey", types: ["Grass"] },
      { number: 813, name: "Scorbunny", types: ["Fire"] },
      { number: 816, name: "Sobble", types: ["Water"] },
      { number: 906, name: "Sprigatito", types: ["Grass"] },
      { number: 909, name: "Fuecoco", types: ["Fire"] },
      { number: 912, name: "Quaxly", types: ["Water"] }
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
