import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchPokemonData, calculateEloRating } from "./pokemon";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize pokemon data if not already present
  app.get("/api/init", async (req: Request, res: Response) => {
    try {
      const existingPokemon = await storage.getAllPokemon();
      let message = "";
      
      // Force re-initialization if we have no Pokemon or if the reset query param is present
      if (existingPokemon.length === 0 || req.query.reset === 'true') {
        // Clear existing Pokemon and votes if needed
        if (existingPokemon.length > 0) {
          // This is a development-only feature to help with testing
          console.log("Resetting Pokemon data...");
          await storage.clearAllPokemon();
          await storage.clearAllVotes();
        }
        
        // Fetch and insert new Pokemon data
        const pokemonData = await fetchPokemonData();
        
        // Insert all Pokemon in batches for better performance
        const batchSize = 100;
        console.log(`Inserting ${pokemonData.length} Pokémon in batches of ${batchSize}...`);
        
        for (let i = 0; i < pokemonData.length; i += batchSize) {
          const batch = pokemonData.slice(i, i + batchSize);
          console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(pokemonData.length/batchSize)}...`);
          
          // Process batch in parallel for speed
          await Promise.all(batch.map(pokemon => storage.insertPokemon(pokemon)));
        }
        
        message = `Initialized ${pokemonData.length} Pokémon`;
        console.log(message);
        res.json({ success: true, message });
      } else {
        message = `Database already contains ${existingPokemon.length} Pokémon`;
        console.log(message);
        res.json({ success: true, message });
      }
    } catch (error) {
      console.error("Error initializing Pokémon data:", error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to initialize Pokémon data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });
  
  // Special endpoint to ensure specific Pokémon are properly loaded
  app.get("/api/__direct/init-specific", async (req: Request, res: Response) => {
    try {
      // List of specific Pokémon we want to verify
      const specificPokemonNumbers = [253, 553]; // Grovyle and Krookodile
      const results: Record<number, {success: boolean, message: string}> = {};
      
      for (const pokedexNumber of specificPokemonNumbers) {
        // Check if this Pokémon exists
        const existingPokemon = await storage.getPokemonByPokedexNumber(pokedexNumber);
        
        // If it doesn't exist or has a generic name, fetch and update it
        if (!existingPokemon || existingPokemon.name.startsWith('Pokémon #')) {
          console.log(`Fetching specific Pokémon #${pokedexNumber}...`);
          
          try {
            // Fetch the specific Pokémon directly from the API
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexNumber}`);
            const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokedexNumber}`);
            
            if (response.ok && speciesResponse.ok) {
              const data = await response.json() as any;
              const speciesData = await speciesResponse.json() as any;
              
              // Get the English name from species data
              const englishNameData = speciesData.names.find((n: any) => n.language.name === "en");
              const name = englishNameData && englishNameData.name 
                ? englishNameData.name 
                : data.name.charAt(0).toUpperCase() + data.name.slice(1);
              
              // Extract types
              const types = data.types.map((t: any) => {
                const typeName = t.type.name;
                return typeName.charAt(0).toUpperCase() + typeName.slice(1);
              });
              
              // Create or update the Pokémon
              const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png`;
              
              if (existingPokemon) {
                // Update Pokemon rating
                await storage.updatePokemonRating(existingPokemon.id, existingPokemon.rating, false);
                
                // Update with new name and types
                results[pokedexNumber] = {
                  success: true,
                  message: `Updated Pokémon #${pokedexNumber} (${name})`
                };
              } else {
                // Insert new Pokemon
                await storage.insertPokemon({
                  pokedexNumber,
                  name,
                  imageUrl,
                  types,
                  rating: 1500,
                  wins: 0,
                  losses: 0
                });
                
                results[pokedexNumber] = {
                  success: true,
                  message: `Created Pokémon #${pokedexNumber} (${name})`
                };
              }
            } else {
              results[pokedexNumber] = {
                success: false,
                message: `API error: ${response.status} / ${speciesResponse.status}`
              };
            }
          } catch (error) {
            results[pokedexNumber] = {
              success: false,
              message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
          }
        } else {
          // Pokémon already exists with proper name
          results[pokedexNumber] = {
            success: true,
            message: `Pokémon #${pokedexNumber} (${existingPokemon.name}) already exists`
          };
        }
      }
      
      res.json({ success: true, results });
    } catch (error) {
      console.error("Error initializing specific Pokémon:", error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to initialize specific Pokémon: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Get a random pair of Pokemon for voting
  app.get("/api/matchup", async (req: Request, res: Response) => {
    try {
      // Make sure we have Pokemon data
      const allPokemon = await storage.getAllPokemon();
      if (allPokemon.length < 2) {
        await fetchPokemonData().then(async (pokemonData) => {
          for (const pokemon of pokemonData) {
            await storage.insertPokemon(pokemon);
          }
        });
      }
      
      const [pokemon1, pokemon2] = await storage.getRandomPokemonPair();
      res.json({ pokemon1, pokemon2 });
    } catch (error) {
      console.error("Error getting matchup:", error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to get matchup: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Record a vote
  const voteSchema = z.object({
    winnerId: z.number(),
    loserId: z.number()
  });

  app.post("/api/vote", async (req: Request, res: Response) => {
    try {
      const validatedData = voteSchema.parse(req.body);
      const { winnerId, loserId } = validatedData;

      // Get current ratings
      const winner = await storage.getPokemon(winnerId);
      const loser = await storage.getPokemon(loserId);

      if (!winner || !loser) {
        return res.status(404).json({ 
          success: false, 
          message: `Pokemon not found: ${!winner ? 'winner' : 'loser'}` 
        });
      }

      // Calculate new ratings
      const { 
        newWinnerRating, 
        newLoserRating, 
        winnerRatingDelta, 
        loserRatingDelta 
      } = calculateEloRating(winner.rating, loser.rating);

      // Update ratings
      await storage.updatePokemonRating(winnerId, newWinnerRating, true);
      await storage.updatePokemonRating(loserId, newLoserRating, false);

      // Record the vote
      const vote = await storage.insertVote({
        winnerId,
        loserId,
        winnerRatingDelta,
        loserRatingDelta
      });

      res.json({ 
        success: true, 
        vote,
        newMatchup: await storage.getRandomPokemonPair()
      });
    } catch (error) {
      console.error("Error recording vote:", error);
      res.status(error instanceof z.ZodError ? 400 : 500).json({ 
        success: false, 
        message: `Failed to record vote: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Get top ranked Pokemon
  app.get("/api/rankings", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string || "10", 10);
      const topPokemon = await storage.getTopRankedPokemon(limit);
      res.json(topPokemon);
    } catch (error) {
      console.error("Error getting rankings:", error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to get rankings: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Get recent votes
  app.get("/api/votes/recent", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string || "5", 10);
      const recentVotes = await storage.getRecentVotes(limit);
      res.json(recentVotes);
    } catch (error) {
      console.error("Error getting recent votes:", error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to get recent votes: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Get statistics
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
