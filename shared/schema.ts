import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pokemon table to store data fetched from the wiki
export const pokemons = pgTable("pokemons", {
  id: serial("id").primaryKey(),
  pokedexNumber: integer("pokedex_number").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  types: text("types").array().notNull(),
  rating: integer("rating").notNull().default(1500),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
});

export const insertPokemonSchema = createInsertSchema(pokemons).omit({
  id: true,
});

// Table to store voting history
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  winnerId: integer("winner_id").notNull(),
  loserId: integer("loser_id").notNull(),
  winnerRatingDelta: integer("winner_rating_delta").notNull(),
  loserRatingDelta: integer("loser_rating_delta").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  timestamp: true,
});

// Types for database operations
export type Pokemon = typeof pokemons.$inferSelect;
export type InsertPokemon = z.infer<typeof insertPokemonSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

// Stats schema for app statistics
export const statsSchema = z.object({
  totalVotes: z.number(),
  totalPokemon: z.number(),
  votesToday: z.number(),
  typeWinRates: z.array(
    z.object({
      type: z.string(),
      winRate: z.number(),
      color: z.string(),
    })
  ),
});

export type Stats = z.infer<typeof statsSchema>;

// Custom interfaces for frontend use
export interface PokemonWithRank extends Pokemon {
  rank: number;
}

export interface VoteWithPokemon extends Vote {
  winner: Pokemon;
  loser: Pokemon;
  timeAgo: string;
}
