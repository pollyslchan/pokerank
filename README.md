# Pokémon Rankings

A full-stack interactive web application that allows users to vote on their favorite Pokémon and see global rankings.

## Features

- Vote between random pairs of Pokémon
- View global rankings based on ELO rating
- See recent voting activity
- Type-based statistics
- Responsive design (mobile and desktop friendly)
- Complete collection of all 1025 Pokémon from all generations
- PostgreSQL database for persistent storage

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

To add screenshots to the project:

1. Take screenshots of the application (voting interface, leaderboard, etc.)
2. Save them in the `screenshots` directory
3. Update this README to include the screenshots with descriptions

Example:
```markdown
![Voting Interface](screenshots/voting-interface.png)
*Caption: The voting interface showing two Pokémon cards side by side*
```

## Data Source

Pokémon data is sourced from the [PokeAPI](https://pokeapi.co/).

## Updating the Application

### Adding New Features

1. Create a new branch: `git checkout -b feature/my-new-feature`
2. Implement your changes
3. Test thoroughly
4. Commit your changes: `git commit -m "Add my new feature"`
5. Push to your branch: `git push origin feature/my-new-feature`
6. Create a Pull Request on GitHub

### Updating Pokémon Data

If new Pokémon are released:

1. Update the fetch logic in `server/pokemon.ts`
2. Adjust the max Pokémon count in the appropriate constants
3. Run the data initialization endpoint to fetch the new Pokémon data

## Deployment

For detailed deployment instructions, please refer to the [DEPLOYMENT.md](./DEPLOYMENT.md) file.

## Contributions

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.