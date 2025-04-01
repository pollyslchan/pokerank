import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-pokemon-red text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png" 
            alt="Pokéball logo" 
            className="w-8 h-8 mr-3" 
          />
          <Link href="/">
            <a className="text-2xl font-bold font-poppins">PokéRank</a>
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/#voting">
            <a className={`font-medium hover:underline ${location === "/#voting" ? "underline" : ""}`}>Vote</a>
          </Link>
          <Link href="/#rankings">
            <a className={`font-medium hover:underline ${location === "/#rankings" ? "underline" : ""}`}>Rankings</a>
          </Link>
          <Link href="/#history">
            <a className={`font-medium hover:underline ${location === "/#history" ? "underline" : ""}`}>History</a>
          </Link>
          <Link href="/#about">
            <a className={`font-medium hover:underline ${location === "/#about" ? "underline" : ""}`}>About</a>
          </Link>
        </nav>
        
        <button 
          className="md:hidden text-white" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
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
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-pokemon-red pb-4`}>
        <div className="container mx-auto px-4 flex flex-col space-y-2">
          <Link href="/#voting">
            <a className="text-white py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Vote</a>
          </Link>
          <Link href="/#rankings">
            <a className="text-white py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Rankings</a>
          </Link>
          <Link href="/#history">
            <a className="text-white py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>History</a>
          </Link>
          <Link href="/#about">
            <a className="text-white py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          </Link>
        </div>
      </div>
    </header>
  );
}
