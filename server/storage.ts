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
    
    const pokemon: Pokemon = { 
      ...insertPokemon, 
      id,
      name, // Use fixed name
      types: finalTypes, // Use fixed types
      rating: insertPokemon.rating || 1500,
      wins: insertPokemon.wins || 0,
      losses: insertPokemon.losses || 0
    };
    
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
    // Get all Pokemon
    const allPokemon = Array.from(this.pokemon.values());
    if (allPokemon.length < 2) {
      throw new Error("Not enough Pokemon to create a pair");
    }
    
    // Define valid Pokemon types
    const validTypes = [
      "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
      "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
      "Steel", "Fairy"
    ];
    
    // Fix problematic Pokemon on-the-fly
    const fixedPokemon: Pokemon[] = allPokemon.map(pokemon => {
      // Check if this Pokemon has valid types
      const hasValidTypes = pokemon.types.every(type => validTypes.includes(type));
      
      if (hasValidTypes) {
        return pokemon; // Already valid
      }
      
      // Make a deep copy of the Pokemon to avoid modifying the original
      const fixedPoke = {...pokemon};
      
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
        
        // Multiples of 50
        50: ["Ground"], // Diglett
        100: ["Electric"], // Voltorb
        200: ["Ghost"], // Misdreavus
        250: ["Fire", "Flying"], // Ho-Oh
        350: ["Water"], // Milotic
        400: ["Normal", "Water"], // Bibarel
        450: ["Ground"], // Hippowdon
        500: ["Fire", "Fighting"], // Emboar
        550: ["Water"], // Basculin
        600: ["Steel"], // Klinklang
        650: ["Grass"], // Chespin
        700: ["Fairy"], // Sylveon
        750: ["Ground"], // Mudsdale
        800: ["Psychic"], // Necrozma
        850: ["Fire", "Bug"], // Sizzlipede
        900: ["Rock"], // Klawf
        950: ["Dragon", "Water"], // Tatsugiri
        1000: ["Steel", "Ghost"], // Gholdengo
      };
      
      // Use hardcoded types if available
      if (hardcodedTypesByPokedexNumber[pokemon.pokedexNumber]) {
        fixedPoke.types = [...hardcodedTypesByPokedexNumber[pokemon.pokedexNumber]];
      } else {
        // Otherwise, use Normal as a fallback
        fixedPoke.types = ["Normal"];
      }
      
      // Also fix names
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
      if (knownPokemonNames[pokemon.pokedexNumber]) {
        fixedPoke.name = knownPokemonNames[pokemon.pokedexNumber];
      }
      
      // Store the fixed Pokemon back in the Map to avoid having to fix it again
      this.pokemon.set(pokemon.id, fixedPoke);
      
      return fixedPoke;
    });
    
    // Get two different random Pokemon
    const randomIndex1 = Math.floor(Math.random() * fixedPokemon.length);
    let randomIndex2 = Math.floor(Math.random() * (fixedPokemon.length - 1));
    if (randomIndex2 >= randomIndex1) randomIndex2++;
    
    return [fixedPokemon[randomIndex1], fixedPokemon[randomIndex2]];
  }

  async getTopRankedPokemon(limit: number): Promise<PokemonWithRank[]> {
    // Get all Pokemon
    const allPokemon = Array.from(this.pokemon.values());
    
    // Define valid Pokemon types
    const validTypes = [
      "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
      "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
      "Steel", "Fairy"
    ];
    
    // Fix problematic Pokemon on-the-fly
    const fixedPokemon: Pokemon[] = allPokemon.map(pokemon => {
      // Check if this Pokemon has valid types
      const hasValidTypes = pokemon.types.every(type => validTypes.includes(type));
      
      if (hasValidTypes) {
        return pokemon; // Already valid
      }
      
      // Make a deep copy of the Pokemon to avoid modifying the original
      const fixedPoke = {...pokemon};
      
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
        
        // Multiples of 50
        50: ["Ground"], // Diglett
        100: ["Electric"], // Voltorb
        200: ["Ghost"], // Misdreavus
        250: ["Fire", "Flying"], // Ho-Oh
        350: ["Water"], // Milotic
        400: ["Normal", "Water"], // Bibarel
        450: ["Ground"], // Hippowdon
        500: ["Fire", "Fighting"], // Emboar
        550: ["Water"], // Basculin
        600: ["Steel"], // Klinklang
        650: ["Grass"], // Chespin
        700: ["Fairy"], // Sylveon
        750: ["Ground"], // Mudsdale
        800: ["Psychic"], // Necrozma
        850: ["Fire", "Bug"], // Sizzlipede
        900: ["Rock"], // Klawf
        950: ["Dragon", "Water"], // Tatsugiri
        1000: ["Steel", "Ghost"], // Gholdengo
      };
      
      // Use hardcoded types if available
      if (hardcodedTypesByPokedexNumber[pokemon.pokedexNumber]) {
        fixedPoke.types = [...hardcodedTypesByPokedexNumber[pokemon.pokedexNumber]];
      } else {
        // Otherwise, use Normal as a fallback
        fixedPoke.types = ["Normal"];
      }
      
      // Also fix names
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
      if (knownPokemonNames[pokemon.pokedexNumber]) {
        fixedPoke.name = knownPokemonNames[pokemon.pokedexNumber];
      }
      
      // Store the fixed Pokemon back in the Map to avoid having to fix it again
      this.pokemon.set(pokemon.id, fixedPoke);
      
      return fixedPoke;
    });
    
    // Sort by rating in descending order
    const sortedPokemon = fixedPokemon.sort((a, b) => b.rating - a.rating);
    
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

  async clearAllPokemon(): Promise<void> {
    this.pokemon.clear();
    this.pokemonCurrentId = 1;
    console.log("Cleared all Pokémon data");
  }
  
  async clearAllVotes(): Promise<void> {
    this.votes = [];
    this.voteCurrentId = 1;
    console.log("Cleared all vote data");
    
    // Reset all Pokemon win/loss records
    for (const pokemon of this.pokemon.values()) {
      pokemon.wins = 0;
      pokemon.losses = 0;
      pokemon.rating = 1500; // Reset to default rating
    }
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
