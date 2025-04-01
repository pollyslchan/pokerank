import { 
  Pokemon, InsertPokemon, 
  Vote, InsertVote, 
  PokemonWithRank, VoteWithPokemon,
  Stats,
  pokemons,
  votes
} from "@shared/schema";
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, desc, asc, sql, and, gte } from 'drizzle-orm';
import postgres from 'postgres';
import { IStorage } from "./storage";

export class DrizzleStorage implements IStorage {
  private db: any; // Using any type to avoid TypeScript compatibility issues
  private typeColors: Record<string, string>;

  constructor() {
    // Initialize the PostgreSQL connection
    const client = postgres(process.env.DATABASE_URL!);
    this.db = drizzle(client);
    
    // Map of Pokémon types to colors
    this.typeColors = {
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
  }

  async getPokemon(id: number): Promise<Pokemon | undefined> {
    const result = await this.db.select().from(pokemons).where(eq(pokemons.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getPokemonByPokedexNumber(pokedexNumber: number): Promise<Pokemon | undefined> {
    const result = await this.db.select().from(pokemons).where(eq(pokemons.pokedexNumber, pokedexNumber));
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllPokemon(): Promise<Pokemon[]> {
    return await this.db.select().from(pokemons);
  }

  async insertPokemon(insertPokemon: InsertPokemon): Promise<Pokemon> {
    // Define valid Pokemon types
    const validTypes = [
      "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
      "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
      "Steel", "Fairy"
    ];
    
    // Ensure types are valid English type names, not Japanese Pokemon names
    const sanitizedTypes = [];
    
    for (const type of insertPokemon.types) {
      if (validTypes.includes(type)) {
        sanitizedTypes.push(type);
      } else {
        // Check if this is a Pokemon with known types
        const pokemonNumber = insertPokemon.pokedexNumber;
        
        // Define hardcoded types for problematic Pokemon
        const hardcodedTypesByPokedexNumber: Record<number, string[]> = {
          // Gen 1-4 starters
          1: ["Grass", "Poison"], // Bulbasaur
          4: ["Fire"], // Charmander
          7: ["Water"], // Squirtle
          152: ["Grass"], // Chikorita
          155: ["Fire"], // Cyndaquil
          158: ["Water"], // Totodile
          252: ["Grass"], // Treecko
          255: ["Fire"], // Torchic
          258: ["Water"], // Mudkip
          387: ["Grass"], // Turtwig
          390: ["Fire"], // Chimchar
          393: ["Water"], // Piplup
          
          // Gen 5+ starters
          495: ["Grass"], // Snivy
          498: ["Fire"], // Tepig
          501: ["Water"], // Oshawott
          650: ["Grass"], // Chespin
          653: ["Fire"], // Fennekin
          656: ["Water"], // Froakie
          722: ["Grass", "Flying"], // Rowlet
          725: ["Fire"], // Litten
          728: ["Water"], // Popplio
          810: ["Grass"], // Grookey
          813: ["Fire"], // Scorbunny
          816: ["Water"], // Sobble
          906: ["Grass"], // Sprigatito
          909: ["Fire"], // Fuecoco
          912: ["Water"], // Quaxly
          
          // Other popular Pokemon
          25: ["Electric"], // Pikachu
          150: ["Psychic"], // Mewtwo
          300: ["Normal"], // Skitty
          800: ["Psychic"], // Necrozma
        };
        
        // Use hardcoded types if available
        if (hardcodedTypesByPokedexNumber[pokemonNumber]) {
          // Clear sanitized types and use all hardcoded ones, then break to avoid duplicates
          sanitizedTypes.push(...hardcodedTypesByPokedexNumber[pokemonNumber]);
          break;
        }
      }
    }
    
    // Use Normal as a fallback if no valid types were found
    const finalTypes = sanitizedTypes.length > 0 ? sanitizedTypes : ["Normal"];
    
    // Fix names for key Pokemon
    const knownPokemonNames: Record<number, string> = {
      1: "Bulbasaur", 4: "Charmander", 7: "Squirtle", 25: "Pikachu",
      150: "Mewtwo", 152: "Chikorita", 155: "Cyndaquil", 158: "Totodile",
      252: "Treecko", 255: "Torchic", 258: "Mudkip", 300: "Skitty",
      387: "Turtwig", 390: "Chimchar", 393: "Piplup",
      495: "Snivy", 498: "Tepig", 501: "Oshawott", 
      650: "Chespin", 653: "Fennekin", 656: "Froakie",
      722: "Rowlet", 725: "Litten", 728: "Popplio",
      800: "Necrozma", 810: "Grookey", 813: "Scorbunny", 816: "Sobble",
      906: "Sprigatito", 909: "Fuecoco", 912: "Quaxly"
    };
    
    // Use hardcoded name if available
    const name = knownPokemonNames[insertPokemon.pokedexNumber] || insertPokemon.name;
    
    // Prepare the Pokemon data with fixed name and types
    const pokemonData = {
      ...insertPokemon,
      name, // Use fixed name
      types: finalTypes, // Use fixed types
      rating: insertPokemon.rating || 1500,
      wins: insertPokemon.wins || 0,
      losses: insertPokemon.losses || 0
    };
    
    // Check if the Pokemon already exists
    const existingPokemon = await this.getPokemonByPokedexNumber(insertPokemon.pokedexNumber);
    
    if (existingPokemon) {
      // Update existing Pokemon
      await this.db.update(pokemons)
        .set({
          name: pokemonData.name,
          imageUrl: pokemonData.imageUrl,
          types: pokemonData.types,
          rating: pokemonData.rating,
          wins: pokemonData.wins,
          losses: pokemonData.losses
        })
        .where(eq(pokemons.pokedexNumber, pokemonData.pokedexNumber));
      
      return {
        ...existingPokemon,
        name: pokemonData.name,
        imageUrl: pokemonData.imageUrl,
        types: pokemonData.types,
        rating: pokemonData.rating,
        wins: pokemonData.wins,
        losses: pokemonData.losses
      };
    } else {
      // Insert new Pokemon
      const result = await this.db.insert(pokemons).values(pokemonData).returning();
      return result[0];
    }
  }

  async updatePokemonRating(id: number, rating: number, isWinner: boolean): Promise<Pokemon> {
    // Get the current Pokemon
    const pokemonResult = await this.db.select().from(pokemons).where(eq(pokemons.id, id));
    
    if (pokemonResult.length === 0) {
      throw new Error(`Pokemon with id ${id} not found`);
    }
    
    const pokemon = pokemonResult[0];
    
    // Update the rating and wins/losses
    const result = await this.db.update(pokemons)
      .set({
        rating: rating,
        wins: isWinner ? pokemon.wins + 1 : pokemon.wins,
        losses: isWinner ? pokemon.losses : pokemon.losses + 1
      })
      .where(eq(pokemons.id, id))
      .returning();
    
    return result[0];
  }

  async getRandomPokemonPair(): Promise<[Pokemon, Pokemon]> {
    // Get the count of Pokemon
    const countResult = await this.db.select({ count: sql`count(*)` }).from(pokemons);
    const count = Number(countResult[0].count);
    
    if (count < 2) {
      throw new Error("Not enough Pokemon to create a pair");
    }
    
    // Get two random Pokemon
    const offset1 = Math.floor(Math.random() * count);
    let offset2 = Math.floor(Math.random() * (count - 1));
    if (offset2 >= offset1) offset2++;
    
    const pokemon1Result = await this.db.select().from(pokemons).limit(1).offset(offset1);
    const pokemon2Result = await this.db.select().from(pokemons).limit(1).offset(offset2);
    
    if (pokemon1Result.length === 0 || pokemon2Result.length === 0) {
      // Fallback to getting any two Pokemon if offsets don't work
      const allPokemon = await this.db.select().from(pokemons).limit(2);
      if (allPokemon.length < 2) {
        throw new Error("Not enough Pokemon to create a pair");
      }
      return [allPokemon[0], allPokemon[1]];
    }
    
    // Validate and ensure proper types
    // Define valid Pokemon types
    const validTypes = [
      "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
      "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
      "Steel", "Fairy"
    ];
    
    const fixPokemon = async (pokemon: Pokemon): Promise<Pokemon> => {
      // Check if this Pokemon has valid types
      const hasValidTypes = pokemon.types.every(type => validTypes.includes(type));
      
      if (hasValidTypes) {
        return pokemon; // Already valid
      }
      
      // Define hardcoded types for problematic Pokemon
      const hardcodedTypesByPokedexNumber: Record<number, string[]> = {
        // Gen 1-4 starters
        1: ["Grass", "Poison"], // Bulbasaur
        4: ["Fire"], // Charmander
        7: ["Water"], // Squirtle
        152: ["Grass"], // Chikorita
        155: ["Fire"], // Cyndaquil
        158: ["Water"], // Totodile
        252: ["Grass"], // Treecko
        255: ["Fire"], // Torchic
        258: ["Water"], // Mudkip
        387: ["Grass"], // Turtwig
        390: ["Fire"], // Chimchar
        393: ["Water"], // Piplup
        
        // Gen 5+ starters
        495: ["Grass"], // Snivy
        498: ["Fire"], // Tepig
        501: ["Water"], // Oshawott
        650: ["Grass"], // Chespin
        653: ["Fire"], // Fennekin
        656: ["Water"], // Froakie
        722: ["Grass", "Flying"], // Rowlet
        725: ["Fire"], // Litten
        728: ["Water"], // Popplio
        810: ["Grass"], // Grookey
        813: ["Fire"], // Scorbunny
        816: ["Water"], // Sobble
        906: ["Grass"], // Sprigatito
        909: ["Fire"], // Fuecoco
        912: ["Water"], // Quaxly
        
        // Other popular Pokemon
        25: ["Electric"], // Pikachu
        150: ["Psychic"], // Mewtwo
        300: ["Normal"], // Skitty
        800: ["Psychic"], // Necrozma
      };
      
      // Prepare the fixed data
      let fixedTypes: string[];
      
      // Use hardcoded types if available
      if (hardcodedTypesByPokedexNumber[pokemon.pokedexNumber]) {
        fixedTypes = [...hardcodedTypesByPokedexNumber[pokemon.pokedexNumber]];
      } else {
        // Otherwise, use Normal as a fallback
        fixedTypes = ["Normal"];
      }
      
      // Fix names
      const knownPokemonNames: Record<number, string> = {
        1: "Bulbasaur", 4: "Charmander", 7: "Squirtle", 25: "Pikachu",
        150: "Mewtwo", 152: "Chikorita", 155: "Cyndaquil", 158: "Totodile",
        252: "Treecko", 255: "Torchic", 258: "Mudkip", 300: "Skitty",
        387: "Turtwig", 390: "Chimchar", 393: "Piplup",
        495: "Snivy", 498: "Tepig", 501: "Oshawott", 
        650: "Chespin", 653: "Fennekin", 656: "Froakie",
        722: "Rowlet", 725: "Litten", 728: "Popplio",
        800: "Necrozma", 810: "Grookey", 813: "Scorbunny", 816: "Sobble",
        906: "Sprigatito", 909: "Fuecoco", 912: "Quaxly"
      };
      
      // Use hardcoded name if available
      const fixedName = knownPokemonNames[pokemon.pokedexNumber] || pokemon.name;
      
      // Update the pokemon in the database
      const result = await this.db.update(pokemons)
        .set({
          types: fixedTypes,
          name: fixedName
        })
        .where(eq(pokemons.id, pokemon.id))
        .returning();
      
      return result[0];
    };
    
    // Fix both Pokemon
    const fixedPokemon1 = await fixPokemon(pokemon1Result[0]);
    const fixedPokemon2 = await fixPokemon(pokemon2Result[0]);
    
    return [fixedPokemon1, fixedPokemon2];
  }

  async getTopRankedPokemon(limit: number): Promise<PokemonWithRank[]> {
    let query = this.db.select().from(pokemons).orderBy(desc(pokemons.rating));
    
    // If limit is very large (1000+), we're asking for all Pokémon
    // Otherwise apply the limit for top rankings
    if (limit < 1000) {
      query = query.limit(limit);
    }
    
    const result = await query;
    
    // Add rank to each Pokemon
    return result.map((pokemon, index) => ({
      ...pokemon,
      rank: index + 1
    }));
  }

  async insertVote(insertVote: InsertVote): Promise<Vote> {
    // Insert the vote
    const result = await this.db.insert(votes)
      .values({
        ...insertVote,
        timestamp: new Date()
      })
      .returning();
    
    return result[0];
  }

  async getRecentVotes(limit: number): Promise<VoteWithPokemon[]> {
    // Get recent votes ordered by timestamp
    const recentVotes = await this.db.select()
      .from(votes)
      .orderBy(desc(votes.timestamp))
      .limit(limit);
    
    // Prepare the results with Pokemon data
    const result: VoteWithPokemon[] = [];
    
    for (const vote of recentVotes) {
      // Get winner Pokemon
      const winnerResult = await this.db.select().from(pokemons).where(eq(pokemons.id, vote.winnerId));
      
      // Get loser Pokemon
      const loserResult = await this.db.select().from(pokemons).where(eq(pokemons.id, vote.loserId));
      
      if (winnerResult.length === 0 || loserResult.length === 0) {
        continue; // Skip if Pokemon not found
      }
      
      const winner = winnerResult[0];
      const loser = loserResult[0];
      
      // Calculate time ago
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - vote.timestamp.getTime()) / (1000 * 60));
      
      let timeAgo: string;
      if (diffInMinutes < 1) {
        timeAgo = 'just now';
      } else if (diffInMinutes < 60) {
        timeAgo = `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        timeAgo = `${hours} hour${hours === 1 ? '' : 's'} ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        timeAgo = `${days} day${days === 1 ? '' : 's'} ago`;
      }
      
      result.push({
        ...vote,
        winner,
        loser,
        timeAgo
      });
    }
    
    return result;
  }

  async clearAllPokemon(): Promise<void> {
    await this.db.delete(pokemons);
    console.log("Cleared all Pokémon data");
  }
  
  async clearAllVotes(): Promise<void> {
    await this.db.delete(votes);
    console.log("Cleared all vote data");
    
    // Reset all Pokemon win/loss records
    await this.db.update(pokemons)
      .set({
        wins: 0,
        losses: 0,
        rating: 1500 // Reset to default rating
      });
  }
  
  async getStats(): Promise<Stats> {
    // Get total Pokemon count
    const pokemonCountResult = await this.db.select({ count: sql`count(*)` }).from(pokemons);
    const totalPokemon = Number(pokemonCountResult[0].count);
    
    // Get total votes count
    const votesCountResult = await this.db.select({ count: sql`count(*)` }).from(votes);
    const totalVotes = Number(votesCountResult[0].count);
    
    // Get votes from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const votesTodayResult = await this.db.select({ count: sql`count(*)` })
      .from(votes)
      .where(gte(votes.timestamp, today));
    
    const votesToday = Number(votesTodayResult[0].count);
    
    // Calculate win rates for each type
    const typeStats: Record<string, { wins: number; total: number }> = {};
    
    // Initialize type stats
    const validTypes = [
      "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
      "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
      "Steel", "Fairy"
    ];
    
    validTypes.forEach(type => {
      typeStats[type] = { wins: 0, total: 0 };
    });
    
    // Process all votes to calculate type stats
    const allVotes = await this.db.select().from(votes);
    
    for (const vote of allVotes) {
      const winnerResult = await this.db.select().from(pokemons).where(eq(pokemons.id, vote.winnerId));
      const loserResult = await this.db.select().from(pokemons).where(eq(pokemons.id, vote.loserId));
      
      if (winnerResult.length === 0 || loserResult.length === 0) {
        continue;
      }
      
      const winner = winnerResult[0];
      const loser = loserResult[0];
      
      // Increment win count for each type of the winner
      for (const type of winner.types) {
        if (typeStats[type]) {
          typeStats[type].wins++;
          typeStats[type].total++;
        }
      }
      
      // Increment total count for each type of the loser
      for (const type of loser.types) {
        if (typeStats[type]) {
          typeStats[type].total++;
        }
      }
    }
    
    // Calculate win rates
    const typeWinRates = validTypes
      .filter(type => typeStats[type].total > 0)
      .map(type => ({
        type,
        winRate: typeStats[type].wins / typeStats[type].total,
        color: this.typeColors[type] || "bg-gray-400"
      }))
      .sort((a, b) => b.winRate - a.winRate);
    
    return {
      totalVotes,
      totalPokemon,
      votesToday,
      typeWinRates
    };
  }
}