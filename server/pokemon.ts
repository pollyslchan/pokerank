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
        if (columns.length < 3) return; // Skip rows with insufficient data

        try {
          // Extract Pokédex number
          const pokedexText = $(columns[0]).text().trim();
          const pokedexMatch = pokedexText.match(/^#?(\d+)/);
          if (!pokedexMatch) return;
          const pokedexNumber = parseInt(pokedexMatch[1], 10);

          // Extract name and image URL
          const nameCell = $(columns[1]);
          const name = nameCell.text().trim();
          
          // Handle different image formats
          let imgElement = nameCell.find('img');
          let imageUrl = '';
          
          // Try different attributes for the image URL
          if (imgElement.length > 0) {
            imageUrl = imgElement.attr('src') || 
                      imgElement.attr('data-src') || 
                      imgElement.attr('data-image-key') || '';
            
            // For lazy-loaded images, prefer the data-src attribute
            if (imageUrl.startsWith('data:') || imageUrl === '') {
              imageUrl = imgElement.attr('data-src') || '';
            }
            
            // Extract from parent link if image URL is still empty
            if (!imageUrl) {
              const parentLink = imgElement.parent('a');
              if (parentLink.length > 0) {
                imageUrl = parentLink.attr('href') || '';
              }
            }
            
            // Ensure URL is absolute
            if (imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            }
          }
          
          // If we couldn't find an image, use a default Pokeball image
          if (!imageUrl) {
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png';
          }

          // Extract types - find the type cells (might be in different columns based on table structure)
          let types: string[] = [];
          const typeColumns = [$(columns[2]), $(columns[3])]; // Check both potential type columns
          
          typeColumns.forEach(typeCell => {
            if (!typeCell) return;
            
            // Try to extract types from links first
            const typeLinks = typeCell.find('a');
            if (typeLinks.length > 0) {
              typeLinks.each((_, element) => {
                const typeText = $(element).text().trim();
                if (typeText && !types.includes(typeText)) {
                  types.push(typeText);
                }
              });
            }
            
            // If no types found from links, try plain text
            if (types.length === 0) {
              const typeText = typeCell.text().trim();
              if (typeText && typeText !== "???" && typeText !== "N/A" && typeText !== "-") {
                types.push(typeText);
              }
            }
          });
          
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
