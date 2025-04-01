import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Create navigation items to avoid duplication
  const navItems = [
    { href: "/#voting", label: "Vote" },
    { href: "/#rankings", label: "Rankings" },
    { href: "/#history", label: "History" },
    { href: "/#about", label: "About" }
  ];

  return (
    <header className="bg-pokemon-red text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png" 
            alt="Pokéball logo" 
            className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" 
          />
          <span className="text-xl sm:text-2xl font-bold font-poppins">
            <Link href="/">PokéRank</Link>
          </span>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`font-medium hover:underline ${location === item.href ? "underline" : ""}`}
            >
              {item.label}
            </Link>
          ))}
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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white py-2 font-medium block" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
