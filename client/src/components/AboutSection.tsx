export default function AboutSection() {
  return (
    <section id="about" className="mb-12">
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">About PokéRank</h3>
        
        <div className="prose max-w-none text-xs sm:text-sm md:text-base">
          <p className="mb-2 sm:mb-3 md:mb-4">
            PokéRank uses an ELO rating system to rank all Pokémon based on head-to-head voting. 
            Each time you vote, the Pokémon's ratings are adjusted accordingly.
          </p>
          
          <h4 className="text-base sm:text-lg md:text-xl font-semibold mt-3 sm:mt-4 md:mt-6 mb-1 sm:mb-2 md:mb-3">How it Works</h4>
          <ol className="list-decimal pl-3 sm:pl-4 md:pl-6 space-y-0.5 sm:space-y-1 md:space-y-2 mb-2 sm:mb-3 md:mb-4">
            <li>Two random Pokémon are selected for each matchup</li>
            <li>Users vote for their preferred Pokémon</li>
            <li>Ratings are adjusted based on the result and the difference in ratings</li>
            <li>Rankings are updated in real-time based on the new ratings</li>
          </ol>
          
          <p className="mb-2 sm:mb-3 md:mb-4">
            All Pokémon data and images are sourced from the 
            <a 
              href="https://pokemon.fandom.com/wiki/List_of_Pok%C3%A9mon" 
              className="text-pokemon-blue hover:underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pokémon Wiki
            </a>.
          </p>
          
          <div className="bg-light-gray rounded-lg p-2 sm:p-3 md:p-4 mt-3 sm:mt-4 md:mt-6">
            <h5 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Data Sources:</h5>
            <p className="text-[10px] sm:text-xs md:text-sm">
              Pokémon data is extracted from the Pokémon Wiki. The application uses official 
              Pokémon images and information for educational and entertainment purposes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
