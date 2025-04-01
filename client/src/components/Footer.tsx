import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-dark-gray text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-bold mb-4">PokéRank</h4>
            <p className="text-gray-300 text-sm">
              A community-driven platform to rank and vote on the best Pokémon through head-to-head matchups.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#voting">
                  <a className="text-gray-300 hover:text-white text-sm">Vote Now</a>
                </Link>
              </li>
              <li>
                <Link href="/#rankings">
                  <a className="text-gray-300 hover:text-white text-sm">View Rankings</a>
                </Link>
              </li>
              <li>
                <Link href="/#history">
                  <a className="text-gray-300 hover:text-white text-sm">Recent Votes</a>
                </Link>
              </li>
              <li>
                <Link href="/#about">
                  <a className="text-gray-300 hover:text-white text-sm">About</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Legal</h4>
            <p className="text-gray-300 text-sm mb-2">
              Pokémon and all related media are trademarks of Nintendo, Game Freak, and Creatures Inc.
            </p>
            <p className="text-gray-300 text-sm">
              This is a fan-made application and is not affiliated with or endorsed by the Pokémon Company.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} PokéRank - All rights reserved</p>
        </div>
      </div>
      
      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 right-6">
        <Link href="/#voting">
          <a className="bg-pokemon-red hover:bg-red-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
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
