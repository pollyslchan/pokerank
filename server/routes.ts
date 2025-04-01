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
      
      if (existingPokemon.length === 0) {
        const pokemonData = await fetchPokemonData();
        
        for (const pokemon of pokemonData) {
          await storage.insertPokemon(pokemon);
        }
        
        res.json({ 
          success: true, 
          message: `Initialized ${pokemonData.length} Pokémon` 
        });
      } else {
        res.json({ 
          success: true, 
          message: `Database already contains ${existingPokemon.length} Pokémon` 
        });
      }
    } catch (error) {
      console.error("Error initializing Pokémon data:", error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to initialize Pokémon data: ${error instanceof Error ? error.message : 'Unknown error'}` 
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
