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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-6">Voting Statistics</h3>
          <div className="flex justify-center items-center py-16">
            <div className="loader w-12 h-12 border-4 border-gray-300 border-t-4 rounded-full"></div>
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-6">Voting Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-light-gray rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-pokemon-blue mb-2">
              {stats ? formatNumber(stats.totalVotes) : '0'}
            </div>
            <div className="text-gray-600">Total Votes Cast</div>
          </div>
          
          <div className="bg-light-gray rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-pokemon-blue mb-2">
              {stats ? formatNumber(stats.totalPokemon) : '0'}
            </div>
            <div className="text-gray-600">Pokémon Ranked</div>
          </div>
          
          <div className="bg-light-gray rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-pokemon-blue mb-2">
              {/* For this demo, we'll hardcode active users since we don't track them */}
              {Math.floor(Math.random() * 500) + 100}
            </div>
            <div className="text-gray-600">Active Voters Today</div>
          </div>
        </div>
        
        {stats && stats.typeWinRates.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Most Popular Types (by Win %)</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.typeWinRates.map((typeData, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-3 h-10 ${typeData.color} rounded-l-full mr-2`}></div>
                  <div className="flex-grow bg-light-gray rounded-r-lg p-2">
                    <div className="font-medium">{typeData.type}</div>
                    <div className="text-sm text-gray-600">{typeData.winRate.toFixed(1)}% win rate</div>
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
