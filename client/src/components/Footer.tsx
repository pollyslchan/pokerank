import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-dark-gray text-white py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">PokéRank</h4>
            <p className="text-gray-300 text-xs sm:text-sm">
              A community-driven platform to rank and vote on the best Pokémon through head-to-head matchups.
            </p>
          </div>
          
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Quick Links</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/#voting">
                  <a className="text-gray-300 hover:text-white text-xs sm:text-sm">Vote Now</a>
                </Link>
              </li>
              <li>
                <Link href="/#rankings">
                  <a className="text-gray-300 hover:text-white text-xs sm:text-sm">View Rankings</a>
                </Link>
              </li>
              <li>
                <Link href="/#history">
                  <a className="text-gray-300 hover:text-white text-xs sm:text-sm">Recent Votes</a>
                </Link>
              </li>
              <li>
                <Link href="/#about">
                  <a className="text-gray-300 hover:text-white text-xs sm:text-sm">About</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Legal</h4>
            <p className="text-gray-300 text-xs sm:text-sm mb-1 sm:mb-2">
              Pokémon and all related media are trademarks of Nintendo, Game Freak, and Creatures Inc.
            </p>
            <p className="text-gray-300 text-xs sm:text-sm">
              This is a fan-made application and is not affiliated with or endorsed by the Pokémon Company.
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700 text-center text-gray-400 text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} PokéRank - All rights reserved</p>
        </div>
      </div>
      
      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Link href="/#voting">
          <a className="bg-pokemon-red hover:bg-red-700 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition">
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
        </Link>
      </div>
    </footer>
  );
}
