import { 
  Pokemon, InsertPokemon, 
  Vote, InsertVote, 
  PokemonWithRank, VoteWithPokemon,
  Stats
} from "@shared/schema";
import { format } from "date-fns";

export interface IStorage {
  // Pokemon methods
  getPokemon(id: number): Promise<Pokemon | undefined>;
  getPokemonByPokedexNumber(pokedexNumber: number): Promise<Pokemon | undefined>;
  getAllPokemon(): Promise<Pokemon[]>;
  insertPokemon(pokemon: InsertPokemon): Promise<Pokemon>;
  updatePokemonRating(id: number, rating: number, isWinner: boolean): Promise<Pokemon>;
  getRandomPokemonPair(): Promise<[Pokemon, Pokemon]>;
  getTopRankedPokemon(limit: number): Promise<PokemonWithRank[]>;
  
  // Vote methods
  insertVote(vote: InsertVote): Promise<Vote>;
  getRecentVotes(limit: number): Promise<VoteWithPokemon[]>;
  
  // Stats methods
  getStats(): Promise<Stats>;
}

export class MemStorage implements IStorage {
  private pokemon: Map<number, Pokemon>;
  private votes: Vote[];
  pokemonCurrentId: number;
  voteCurrentId: number;

  constructor() {
    this.pokemon = new Map();
    this.votes = [];
    this.pokemonCurrentId = 1;
    this.voteCurrentId = 1;
  }

  async getPokemon(id: number): Promise<Pokemon | undefined> {
    return this.pokemon.get(id);
  }

  async getPokemonByPokedexNumber(pokedexNumber: number): Promise<Pokemon | undefined> {
    return Array.from(this.pokemon.values()).find(
      (pokemon) => pokemon.pokedexNumber === pokedexNumber
    );
  }

  async getAllPokemon(): Promise<Pokemon[]> {
    return Array.from(this.pokemon.values());
  }

  async insertPokemon(insertPokemon: InsertPokemon): Promise<Pokemon> {
    const id = this.pokemonCurrentId++;
    const pokemon: Pokemon = { ...insertPokemon, id };
    this.pokemon.set(id, pokemon);
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
    
    // Get two different random Pokemon
    const randomIndex1 = Math.floor(Math.random() * allPokemon.length);
    let randomIndex2 = Math.floor(Math.random() * (allPokemon.length - 1));
    if (randomIndex2 >= randomIndex1) randomIndex2++;
    
    return [allPokemon[randomIndex1], allPokemon[randomIndex2]];
  }

  async getTopRankedPokemon(limit: number): Promise<PokemonWithRank[]> {
    const allPokemon = Array.from(this.pokemon.values());
    
    // Sort by rating in descending order
    const sortedPokemon = allPokemon.sort((a, b) => b.rating - a.rating);
    
    // Add rank to each Pokemon
    return sortedPokemon.slice(0, limit).map((pokemon, index) => ({
      ...pokemon,
      rank: index + 1
    }));
  }

  async insertVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.voteCurrentId++;
    const vote: Vote = { 
      ...insertVote, 
      id, 
      timestamp: new Date() 
    };
    
    this.votes.push(vote);
    return vote;
  }

  async getRecentVotes(limit: number): Promise<VoteWithPokemon[]> {
    // Sort votes by timestamp in descending order
    const sortedVotes = [...this.votes].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    const recentVotes = sortedVotes.slice(0, limit);
    
    // Prepare votes with related Pokemon data
    return recentVotes.map(vote => {
      const winner = this.pokemon.get(vote.winnerId);
      const loser = this.pokemon.get(vote.loserId);
      
      if (!winner || !loser) {
        throw new Error(`Pokemon with id ${!winner ? vote.winnerId : vote.loserId} not found`);
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
      
      return {
        ...vote,
        winner,
        loser,
        timeAgo
      };
    });
  }

  async getStats(): Promise<Stats> {
    const allPokemon = Array.from(this.pokemon.values());
    
    // Calculate win rates for each type
    const typeStats: Record<string, { wins: number; total: number }> = {};
    
    // Map of Pokémon types to colors
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
    
    // Collect win rates by type
    for (const vote of this.votes) {
      const winner = this.pokemon.get(vote.winnerId);
      const loser = this.pokemon.get(vote.loserId);
      
      if (winner && loser) {
        for (const type of winner.types) {
          if (!typeStats[type]) {
            typeStats[type] = { wins: 0, total: 0 };
          }
          typeStats[type].wins += 1;
          typeStats[type].total += 1;
        }
        
        for (const type of loser.types) {
          if (!typeStats[type]) {
            typeStats[type] = { wins: 0, total: 0 };
          }
          typeStats[type].total += 1;
        }
      }
    }
    
    // Calculate win rates
    const typeWinRates = Object.entries(typeStats)
      .filter(([_, stats]) => stats.total >= 5) // Only include types with enough data
      .map(([type, stats]) => ({
        type,
        winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
        color: typeColors[type] || "bg-gray-400" // Fallback color
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 8); // Limit to top 8 types
    
    return {
      totalVotes: this.votes.length,
      totalPokemon: this.pokemon.size,
      typeWinRates,
    };
  }
}

export const storage = new MemStorage();
