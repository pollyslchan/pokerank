# Pokémon Rankings

A full-stack interactive web application that allows users to vote on their favorite Pokémon and see global rankings.

## Features

- Vote between random pairs of Pokémon
- View global rankings based on ELO rating
- See recent voting activity
- Type-based statistics
- Responsive design (mobile and desktop friendly)
- Complete collection of all 1025 Pokémon from all generations

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query (TanStack Query)

## Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up a PostgreSQL database and add the connection string to your environment variables as `DATABASE_URL`
4. Run database migrations with `npm run db:push`
5. Start the development server with `npm run dev`

## How ELO Rating Works

The app uses an ELO rating system to rank Pokémon. When users vote between two Pokémon:

1. The winner's rating increases
2. The loser's rating decreases
3. The amount of rating change depends on the difference in current ratings
4. Pokémon start with a base rating of 1500

## Screenshots

- Voting interface with Pokémon cards
- Leaderboard displaying top ranked Pokémon
- Stats page showing type effectiveness
- Responsive mobile design

## Data Source

Pokémon data is sourced from the [PokeAPI](https://pokeapi.co/).

## Contributions

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.