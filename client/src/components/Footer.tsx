import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-ultraball-black text-white py-6 sm:py-8 border-t-4 border-ultraball-yellow">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-ultraball-yellow">PokéRank</h4>
            <p className="text-gray-300 text-xs sm:text-sm">
              A community-driven platform to rank and vote on the best Pokémon through head-to-head matchups.
            </p>
          </div>
          
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-ultraball-yellow">Quick Links</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <a href="#voting" className="text-gray-300 hover:text-ultraball-yellow text-xs sm:text-sm">Vote Now</a>
              </li>
              <li>
                <a href="#rankings" className="text-gray-300 hover:text-ultraball-yellow text-xs sm:text-sm">View Rankings</a>
              </li>
              <li>
                <a href="#stats" className="text-gray-300 hover:text-ultraball-yellow text-xs sm:text-sm">Recent Votes</a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-ultraball-yellow text-xs sm:text-sm">About</a>
              </li>
            </ul>
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-ultraball-yellow">Legal</h4>
            <p className="text-gray-300 text-xs sm:text-sm mb-1 sm:mb-2">
              Pokémon and all related media are trademarks of Nintendo, Game Freak, and Creatures Inc.
            </p>
            <p className="text-gray-300 text-xs sm:text-sm">
              This is a fan-made application and is not affiliated with or endorsed by the Pokémon Company.
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-ultraball-yellow/30 text-center text-gray-400 text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} PokéRank - All rights reserved</p>
        </div>
      </div>
      
      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <a href="#voting" className="bg-ultraball-yellow hover:bg-yellow-500 text-ultraball-black w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-xl"
          >
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </a>
      </div>
    </footer>
  );
}
