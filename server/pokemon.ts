import { InsertPokemon } from "@shared/schema";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

/**
 * Fetches Pokemon data from the Pokemon wiki
 * @returns Array of Pokemon data objects ready for database insertion
 */
export async function fetchPokemonData(): Promise<InsertPokemon[]> {
  try {
    // Fetch the Pokémon list page
    const response = await fetch('https://pokemon.fandom.com/wiki/List_of_Pok%C3%A9mon');
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokémon data: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const pokemonData: InsertPokemon[] = [];

    // Find all wikitable elements (there are multiple tables for different generations)
    const tables = $('table.wikitable');
    console.log(`Found ${tables.length} Pokemon tables on the wiki page`);
    
    tables.each((tableIndex, tableElement) => {
      // Process each row in the table
      $(tableElement).find('tr').each((rowIndex, row) => {
        // Skip header row
        if (rowIndex === 0) return;

        const columns = $(row).find('td');
        if (columns.length < 2) return; // Skip rows with insufficient data

        try {
          // Extract Pokédex number and name from the first column
          const firstCell = $(columns[0]);
          const pokedexAndName = firstCell.text().trim().split(' ');
          
          if (pokedexAndName.length < 2) return;
          
          const pokedexMatch = pokedexAndName[0].match(/^#?(\d+)/);
          if (!pokedexMatch) return;
          const pokedexNumber = parseInt(pokedexMatch[1], 10);
          
          // Get name
          const name = pokedexAndName.slice(1).join(' ').trim();
          if (!name) return;

          // Get image URL from the second column
          const imageCell = $(columns[1]);
          let imageUrl = '';
          const imgElement = imageCell.find('img').first();

          if (imgElement.length > 0) {
            // Get the original image URL from the data-src attribute
            imageUrl = imgElement.attr('data-src') || imgElement.attr('src') || '';
            
            // Clean up the URL and ensure it's the original version
            if (imageUrl) {
              // Remove any scaling parameters
              imageUrl = imageUrl.replace(/\/scale-to-width-down\/\d+/, '');
              // Remove revision info
              imageUrl = imageUrl.split('/revision/')[0];
              // Ensure it's HTTPS
              if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
              }
              // Add .png extension if missing
              if (!imageUrl.endsWith('.png')) {
                imageUrl += '.png';
              }
            }
          }
          
          // If we couldn't find an image, use a default Pokeball image
          if (!imageUrl) {
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png';
          }

          // Extract types from the type column (typically the last column)
          let types: string[] = [];
          const typeCell = $(columns[columns.length - 1]);
          
          // Try to get types from images first (they typically have alt text with the type)
          const typeImages = typeCell.find('img');
          if (typeImages.length > 0) {
            typeImages.each((_, img) => {
              const typeFromAlt = $(img).attr('alt')?.replace(' type', '').trim();
              if (typeFromAlt && !types.includes(typeFromAlt)) {
                types.push(typeFromAlt);
              }
            });
          }
          
          // If no types found from images, try getting from text
          if (types.length === 0) {
            const typeText = typeCell.text().trim().split('/');
            typeText.forEach(type => {
              const cleanType = type.trim();
              if (cleanType && cleanType !== "???" && cleanType !== "N/A" && cleanType !== "-" && !types.includes(cleanType)) {
                types.push(cleanType);
              }
            });
          }
          
          // If still no types, use a default "Normal" type
          if (types.length === 0) {
            types = ["Normal"];
          }

          // Only add Pokémon if we have the required data
          if (pokedexNumber && name) {
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
        } catch (error) {
          console.error(`Error processing Pokémon row: ${error}`);
        }
      });
    });

    // Sort by Pokedex number to ensure proper ordering
    pokemonData.sort((a, b) => a.pokedexNumber - b.pokedexNumber);
    
    // Remove any duplicates (by Pokedex number)
    const uniquePokemon = pokemonData.filter((pokemon, index, self) => 
      index === self.findIndex(p => p.pokedexNumber === pokemon.pokedexNumber)
    );

    console.log(`Extracted ${uniquePokemon.length} Pokémon from the wiki.`);
    
    // If we have no Pokemon, use a small set of hardcoded ones to ensure the app works
    if (uniquePokemon.length === 0) {
      const defaultPokemon: InsertPokemon[] = [
        {
          pokedexNumber: 1,
          name: "Bulbasaur",
          imageUrl: "https://static.wikia.nocookie.net/pokemon/images/1/1d/0001.png",
          types: ["Grass", "Poison"],
          rating: 1500,
          wins: 0,
          losses: 0
        },
        {
          pokedexNumber: 4,
          name: "Charmander",
          imageUrl: "https://static.wikia.nocookie.net/pokemon/images/0/03/0004.png",
          types: ["Fire"],
          rating: 1500,
          wins: 0,
          losses: 0
        },
        {
          pokedexNumber: 7,
          name: "Squirtle",
          imageUrl: "https://static.wikia.nocookie.net/pokemon/images/9/95/0007.png",
          types: ["Water"],
          rating: 1500,
          wins: 0,
          losses: 0
        },
        {
          pokedexNumber: 25,
          name: "Pikachu",
          imageUrl: "https://static.wikia.nocookie.net/pokemon/images/1/17/0025.png",
          types: ["Electric"],
          rating: 1500,
          wins: 0,
          losses: 0
        }
      ];
      console.log("Using default Pokemon data since none could be fetched from the wiki.");
      return defaultPokemon;
    }
    
    return uniquePokemon;
  } catch (error) {
    console.error(`Failed to fetch Pokémon data: ${error}`);
    
    // Return a fallback set of Pokemon if there's an error
    const fallbackPokemon: InsertPokemon[] = [
      {
        pokedexNumber: 1,
        name: "Bulbasaur",
        imageUrl: "https://static.wikia.nocookie.net/pokemon/images/1/1d/0001.png/revision/latest",
        types: ["Grass", "Poison"],
        rating: 1500,
        wins: 0,
        losses: 0
      },
      {
        pokedexNumber: 4,
        name: "Charmander",
        imageUrl: "https://static.wikia.nocookie.net/pokemon/images/0/03/0004.png/revision/latest",
        types: ["Fire"],
        rating: 1500,
        wins: 0,
        losses: 0
      },
      {
        pokedexNumber: 7,
        name: "Squirtle",
        imageUrl: "https://static.wikia.nocookie.net/pokemon/images/9/95/0007.png/revision/latest",
        types: ["Water"],
        rating: 1500,
        wins: 0,
        losses: 0
      },
      {
        pokedexNumber: 25,
        name: "Pikachu",
        imageUrl: "https://static.wikia.nocookie.net/pokemon/images/1/17/0025.png/revision/latest",
        types: ["Electric"],
        rating: 1500,
        wins: 0,
        losses: 0
      }
    ];
    console.log("Using fallback Pokemon data due to fetch error.");
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
