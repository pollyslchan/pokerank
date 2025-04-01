import { 
  Pokemon, InsertPokemon, 
  Vote, InsertVote, 
  PokemonWithRank, VoteWithPokemon,
  Stats
} from "@shared/schema";

export interface IStorage {
  // Pokemon methods
  getPokemon(id: number): Promise<Pokemon | undefined>;
  getPokemonByPokedexNumber(pokedexNumber: number): Promise<Pokemon | undefined>;
  getAllPokemon(): Promise<Pokemon[]>;
  insertPokemon(pokemon: InsertPokemon): Promise<Pokemon>;
  updatePokemonRating(id: number, rating: number, isWinner: boolean): Promise<Pokemon>;
  getRandomPokemonPair(): Promise<[Pokemon, Pokemon]>;
  getTopRankedPokemon(limit: number): Promise<PokemonWithRank[]>;
  clearAllPokemon(): Promise<void>; // Added method to clear Pokemon data
  
  // Vote methods
  insertVote(vote: InsertVote): Promise<Vote>;
  getRecentVotes(limit: number): Promise<VoteWithPokemon[]>;
  clearAllVotes(): Promise<void>; // Added method to clear vote data
  
  // Stats methods
  getStats(): Promise<Stats>;
}

export class MemStorage implements IStorage {
  private pokemon: Map<number, Pokemon>;
  private votes: Vote[];
  pokemonCurrentId: number;
  voteCurrentId: number;

  constructor() {
    this.pokemon = new Map<number, Pokemon>();
    this.votes = [];
    this.pokemonCurrentId = 1;
    this.voteCurrentId = 1;
  }

  async getPokemon(id: number): Promise<Pokemon | undefined> {
    return this.pokemon.get(id);
  }

  async getPokemonByPokedexNumber(pokedexNumber: number): Promise<Pokemon | undefined> {
    for (const pokemon of this.pokemon.values()) {
      if (pokemon.pokedexNumber === pokedexNumber) {
        return pokemon;
      }
    }
    return undefined;
  }

  async getAllPokemon(): Promise<Pokemon[]> {
    return Array.from(this.pokemon.values());
  }

  async insertPokemon(insertPokemon: InsertPokemon): Promise<Pokemon> {
    // Check if the Pokemon already exists
    const existingPokemon = await this.getPokemonByPokedexNumber(insertPokemon.pokedexNumber);
    
    if (existingPokemon) {
      // Update existing Pokemon
      const updatedPokemon: Pokemon = {
        ...existingPokemon,
        name: insertPokemon.name,
        imageUrl: insertPokemon.imageUrl,
        types: insertPokemon.types,
        rating: insertPokemon.rating || existingPokemon.rating,
        wins: insertPokemon.wins !== undefined ? insertPokemon.wins : existingPokemon.wins,
        losses: insertPokemon.losses !== undefined ? insertPokemon.losses : existingPokemon.losses
      };
      
      this.pokemon.set(existingPokemon.id, updatedPokemon);
      return updatedPokemon;
    }
    
    // Create new Pokemon
    const pokemon: Pokemon = { 
      id: this.pokemonCurrentId++,
      pokedexNumber: insertPokemon.pokedexNumber,
      name: insertPokemon.name,
      imageUrl: insertPokemon.imageUrl,
      types: insertPokemon.types,
      rating: insertPokemon.rating || 1500,
      wins: insertPokemon.wins || 0,
      losses: insertPokemon.losses || 0
    };
    
    this.pokemon.set(pokemon.id, pokemon);
    return pokemon;
  }

  async updatePokemonRating(id: number, rating: number, isWinner: boolean): Promise<Pokemon> {
    const pokemon = this.pokemon.get(id);
    
    if (!pokemon) {
      throw new Error(`Pokemon with id ${id} not found`);
    }
    
    const updatedPokemon: Pokemon = {
      ...pokemon,
      rating,
      wins: isWinner ? pokemon.wins + 1 : pokemon.wins,
      losses: isWinner ? pokemon.losses : pokemon.losses + 1
    };
    
    this.pokemon.set(id, updatedPokemon);
    return updatedPokemon;
  }

  async getRandomPokemonPair(): Promise<[Pokemon, Pokemon]> {
    const allPokemon = Array.from(this.pokemon.values());
    
    if (allPokemon.length < 2) {
      throw new Error("Not enough Pokemon to create a pair");
    }
    
    const indices = new Set<number>();
    while (indices.size < 2) {
      indices.add(Math.floor(Math.random() * allPokemon.length));
    }
    
    const indexArray = Array.from(indices);
    return [allPokemon[indexArray[0]], allPokemon[indexArray[1]]];
  }

  async getTopRankedPokemon(limit: number): Promise<PokemonWithRank[]> {
    const allPokemon = Array.from(this.pokemon.values());
    
    // If limit is very large (1000+), we're asking for all Pokémon
    // Otherwise apply the limit for top rankings
    const pokemonToReturn = allPokemon
      .sort((a, b) => b.rating - a.rating);
      
    const result = limit < 1000 ? pokemonToReturn.slice(0, limit) : pokemonToReturn;
    
    return result.map((pokemon, index) => ({
      ...pokemon,
      rank: index + 1
    }));
  }

  async insertVote(insertVote: InsertVote): Promise<Vote> {
    const vote: Vote = { 
      id: this.voteCurrentId++,
      winnerId: insertVote.winnerId,
      loserId: insertVote.loserId,
      timestamp: new Date()
    };
    
    this.votes.push(vote);
    return vote;
  }

  async getRecentVotes(limit: number): Promise<VoteWithPokemon[]> {
    // Sort votes by timestamp in descending order and take the most recent ones
    const recentVotes = [...this.votes]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    // Prepare the results with Pokemon data
    const result: VoteWithPokemon[] = [];
    
    for (const vote of recentVotes) {
      const winner = this.pokemon.get(vote.winnerId);
      const loser = this.pokemon.get(vote.loserId);
      
      if (!winner || !loser) {
        continue; // Skip if Pokemon not found
      }
      
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
    this.pokemon.clear();
    this.pokemonCurrentId = 1;
    console.log("Cleared all Pokémon data");
  }
  
  async clearAllVotes(): Promise<void> {
    this.votes = [];
    this.voteCurrentId = 1;
    
    // Reset all Pokemon win/loss records
    for (const [id, pokemon] of this.pokemon.entries()) {
      this.pokemon.set(id, {
        ...pokemon,
        wins: 0,
        losses: 0,
        rating: 1500 // Reset to default rating
      });
    }
    console.log("Cleared all vote data");
  }
  
  async getStats(): Promise<Stats> {
    // Calculate stats
    const totalPokemon = this.pokemon.size;
    const totalVotes = this.votes.length;
    
    // Calculate votes from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const votesToday = this.votes.filter(vote => {
      const voteDate = new Date(vote.timestamp);
      return voteDate >= today;
    }).length;
    
    // Calculate win rates for each type
    const typeStats: Record<string, { wins: number; total: number }> = {};
    
    // Initialize type stats for all unique types
    const allTypes = new Set<string>();
    for (const pokemon of this.pokemon.values()) {
      for (const type of pokemon.types) {
        allTypes.add(type);
      }
    }
    
    allTypes.forEach(type => {
      typeStats[type] = { wins: 0, total: 0 };
    });
    
    // Process all votes to calculate type stats
    for (const vote of this.votes) {
      const winner = this.pokemon.get(vote.winnerId);
      const loser = this.pokemon.get(vote.loserId);
      
      if (!winner || !loser) {
        continue;
      }
      
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
    
    // Map type colors
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
    
    // Calculate win rates
    const typeWinRates = Object.keys(typeStats)
      .filter(type => typeStats[type].total > 0)
      .map(type => ({
        type,
        winRate: typeStats[type].wins / typeStats[type].total,
        color: typeColors[type] || "bg-gray-400"
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

// Import the DrizzleStorage class for persistent PostgreSQL database storage
import { DrizzleStorage } from "./db-storage";

// Use PostgreSQL storage if DATABASE_URL is set, otherwise use MemStorage for development/testing
export const storage = process.env.DATABASE_URL 
  ? new DrizzleStorage()
  : new MemStorage();