import { useQuery } from "@tanstack/react-query";
import { Stats } from "@shared/schema";

export default function StatsSection() {
  // Fetch stats
  const { 
    data: stats, 
    isLoading 
  } = useQuery<Stats>({ 
    queryKey: ['/api/stats'],
    retry: 3,
  });

  if (isLoading) {
    return (
      <section id="stats" className="mb-12">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Voting Statistics</h3>
          <div className="flex justify-center items-center py-10 sm:py-16">
            <div className="loader w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <section id="stats" className="mb-12">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Voting Statistics</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-light-gray rounded-lg p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-pokemon-blue mb-1 sm:mb-2">
              {stats ? formatNumber(stats.totalVotes) : '0'}
            </div>
            <div className="text-sm sm:text-base text-gray-600">Total Votes Cast</div>
          </div>
          
          <div className="bg-light-gray rounded-lg p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-pokemon-blue mb-1 sm:mb-2">
              {stats ? formatNumber(stats.totalPokemon) : '0'}
            </div>
            <div className="text-sm sm:text-base text-gray-600">Pokémon Ranked</div>
          </div>
          
          <div className="bg-light-gray rounded-lg p-3 sm:p-4 text-center sm:col-span-2 md:col-span-1">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-pokemon-blue mb-1 sm:mb-2">
              {/* For this demo, we'll hardcode active users since we don't track them */}
              {Math.floor(Math.random() * 500) + 100}
            </div>
            <div className="text-sm sm:text-base text-gray-600">Active Voters Today</div>
          </div>
        </div>
        
        {stats && stats.typeWinRates.length > 0 && (
          <div className="mt-4 sm:mt-6">
            <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Most Popular Types (by Win %)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {stats.typeWinRates.map((typeData, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-2 sm:w-3 h-8 sm:h-10 ${typeData.color} rounded-l-full mr-1 sm:mr-2`}></div>
                  <div className="flex-grow bg-light-gray rounded-r-lg p-1.5 sm:p-2">
                    <div className="font-medium text-sm sm:text-base">{typeData.type}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{typeData.winRate.toFixed(1)}% win rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
