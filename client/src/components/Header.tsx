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
    <header className="bg-ultraball-black text-white shadow-md sticky top-0 z-50 border-b-4 border-ultraball-yellow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 relative animate-rotate hover-rotate">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png" 
              alt="Ultra Ball logo" 
              className="w-full h-full" 
            />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-poppins text-ultraball-yellow animate-float">
            <Link href="/">PokéRank</Link>
          </span>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`font-medium text-white hover:text-ultraball-yellow transition-colors duration-300 hover-scale px-3 py-1 ${location === item.href ? "text-ultraball-yellow border-b-2 border-ultraball-yellow" : ""}`}
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
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-ultraball-black pb-4 border-b-4 border-ultraball-yellow`}>
        <div className="container mx-auto px-4 flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white hover:text-ultraball-yellow py-2 font-medium block transition-colors duration-300 hover-scale" 
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
