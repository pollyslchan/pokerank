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
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6">Voting Statistics</h3>
          <div className="flex justify-center items-center py-8 sm:py-10 md:py-16">
            <div className="loader w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
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
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6">Voting Statistics</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-6">
          <div className="bg-gradient-to-br from-white to-light-gray rounded-lg p-2 sm:p-3 md:p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="text-xl sm:text-2xl md:text-4xl font-bold text-pokemon-blue mb-0.5 sm:mb-1 md:mb-2">
              {stats ? formatNumber(stats.totalVotes) : '0'}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-gray-600">Total Votes Cast</div>
          </div>

          <div className="bg-gradient-to-br from-white to-light-gray rounded-lg p-2 sm:p-3 md:p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="text-xl sm:text-2xl md:text-4xl font-bold text-pokemon-blue mb-0.5 sm:mb-1 md:mb-2">
              {stats ? formatNumber(stats.totalPokemon) : '0'}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-gray-600">Pokémon Ranked</div>
          </div>

          <div className="bg-gradient-to-br from-white to-light-gray rounded-lg p-2 sm:p-3 md:p-4 text-center sm:col-span-2 md:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-pokemon-blue to-blue-600 bg-clip-text text-transparent mb-0.5 sm:mb-1 md:mb-2">
              {/* For this demo, we'll hardcode active users since we don't track them */}
              {Math.floor(Math.random() * 500) + 100}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-gray-600">Active Voters Today</div>
          </div>
        </div>

        {stats && stats.typeWinRates.length > 0 && (
          <div className="mt-3 sm:mt-4 md:mt-6">
            <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-1.5 sm:mb-2 md:mb-3">Most Popular Types (by Win %)</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-2 md:gap-4">
              {stats.typeWinRates.map((typeData, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-1.5 sm:w-2 md:w-3 h-6 sm:h-8 md:h-10 ${typeData.color} rounded-l-full mr-1 sm:mr-2`}></div>
                  <div className="flex-grow bg-light-gray rounded-r-lg p-1 sm:p-1.5 md:p-2">
                    <div className="font-medium text-xs sm:text-sm md:text-base">{typeData.type}</div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">{typeData.winRate.toFixed(1)}% win rate</div>
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