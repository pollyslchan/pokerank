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

    // Find the main table containing Pokémon data
    const table = $('table.wikitable');
    
    // Process each row in the table
    table.find('tr').each((index, row) => {
      // Skip header row
      if (index === 0) return;

      const columns = $(row).find('td');
      if (columns.length < 4) return; // Skip rows with insufficient data

      try {
        // Extract Pokédex number
        const pokedexText = $(columns[0]).text().trim();
        const pokedexMatch = pokedexText.match(/^#?(\d+)/);
        if (!pokedexMatch) return;
        const pokedexNumber = parseInt(pokedexMatch[1], 10);

        // Extract name
        const name = $(columns[1]).text().trim();
        if (!name) return;

        // Extract image URL
        const imgElement = $(columns[1]).find('img');
        let imageUrl = imgElement.attr('src') || imgElement.attr('data-src') || '';
        
        // Clean up image URL (some may have lazy loading attributes)
        if (imageUrl.startsWith('data:')) {
          imageUrl = imgElement.attr('data-src') || '';
        }
        
        // Ensure URL is absolute
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }
        
        if (!imageUrl) return;

        // Extract types
        const typesCell = $(columns[2]);
        const typeElements = typesCell.find('a');
        const types: string[] = [];
        
        typeElements.each((_, element) => {
          const typeText = $(element).text().trim();
          if (typeText && !types.includes(typeText)) {
            types.push(typeText);
          }
        });

        // If no types were found through links, try to extract text
        if (types.length === 0) {
          const typeText = typesCell.text().trim();
          const possibleTypes = typeText.split(/\s*,\s*/);
          
          possibleTypes.forEach(type => {
            const cleanedType = type.trim();
            if (cleanedType && !types.includes(cleanedType)) {
              types.push(cleanedType);
            }
          });
        }

        // Only add Pokémon if we have all required data
        if (pokedexNumber && name && imageUrl && types.length > 0) {
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

    console.log(`Extracted ${pokemonData.length} Pokémon from the wiki.`);
    return pokemonData;
  } catch (error) {
    console.error(`Failed to fetch Pokémon data: ${error}`);
    throw error;
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
