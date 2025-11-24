"use client";

interface ImprovementChartProps {
  data: Array<{
    attemptNumber: number;
    score: number;
    percentage: number;
    knowledgeLevel: string;
    completedAt: string;
  }>;
  category: string;
}

export function ImprovementChart({ data, category }: ImprovementChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No assessment data available yet
      </div>
    );
  }

  const maxScore = Math.max(...data.map(d => d.percentage), 100);
  const minScore = Math.min(...data.map(d => d.percentage), 0);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📈 Progress Over Time
        </h3>
        <p className="text-sm text-gray-600 mt-1">Track your improvement across multiple attempts</p>
      </div>

      {/* Chart Area */}
      <div className="relative h-[350px] border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 shadow-lg backdrop-blur-sm">
        {/* Grid lines */}
        <div className="absolute left-14 right-6 top-6 bottom-16">
          {[0, 25, 50, 75, 100].map((val) => (
            <div
              key={val}
              className="absolute w-full border-t border-gray-200/60"
              style={{ bottom: `${val}%` }}
            />
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-2 top-6 bottom-16 flex flex-col justify-between text-xs font-semibold text-gray-600">
          <span className="bg-white px-1 rounded">100%</span>
          <span className="bg-white px-1 rounded">75%</span>
          <span className="bg-white px-1 rounded">50%</span>
          <span className="bg-white px-1 rounded">25%</span>
          <span className="bg-white px-1 rounded">0%</span>
        </div>

        {/* Chart grid and data */}
        <div className="ml-14 mr-6 h-full flex items-end justify-around gap-2 relative">
          {data.map((item, index) => {
            const height = (item.percentage / 100) * 100;
            const prevItem = index > 0 ? data[index - 1] : null;
            const improvement = prevItem ? item.percentage - prevItem.percentage : 0;
            
            // Dynamic color based on score
            const getBarColor = (percentage: number) => {
              if (percentage >= 80) return 'from-emerald-500 via-green-500 to-emerald-600';
              if (percentage >= 60) return 'from-blue-500 via-indigo-500 to-blue-600';
              if (percentage >= 40) return 'from-amber-500 via-yellow-500 to-amber-600';
              return 'from-orange-500 via-red-500 to-orange-600';
            };

            const getPointColor = (percentage: number) => {
              if (percentage >= 80) return 'bg-emerald-600 ring-emerald-200';
              if (percentage >= 60) return 'bg-blue-600 ring-blue-200';
              if (percentage >= 40) return 'bg-amber-600 ring-amber-200';
              return 'bg-orange-600 ring-orange-200';
            };
            
            return (
              <div key={index} className="flex flex-col items-center group relative flex-1 max-w-[100px]">
                {/* Line connector to previous point */}
                {prevItem && (
                  <svg 
                    className="absolute w-full h-full pointer-events-none z-10"
                    style={{ 
                      left: '-50%',
                      top: `calc(${100 - height}% - 12px)`,
                    }}
                  >
                    <defs>
                      <linearGradient id={`lineGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <line
                      x1="50%"
                      y1={`${100 - ((prevItem.percentage / 100) * 100)}%`}
                      x2="150%"
                      y2="0"
                      stroke={`url(#lineGradient${index})`}
                      strokeWidth="3"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                  </svg>
                )}

                {/* Bar */}
                <div className="w-full flex flex-col justify-end h-[240px] relative z-20">
                  <div
                    className={`w-full bg-gradient-to-t ${getBarColor(item.percentage)} rounded-t-xl relative transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg`}
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Data point */}
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 ${getPointColor(item.percentage)} rounded-full border-4 border-white shadow-xl ring-4 transition-all group-hover:scale-125 group-hover:shadow-2xl z-30`}>
                      <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
                    </div>
                    
                    {/* Percentage label on bar */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white font-bold text-xs bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.percentage}%
                    </div>
                    
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 hidden group-hover:block z-50">
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white text-xs rounded-xl py-3 px-4 whitespace-nowrap shadow-2xl border border-gray-700">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                          <span className="text-lg font-bold">{item.percentage}%</span>
                          <span className="text-gray-400">Attempt #{item.attemptNumber}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-400">Score:</span>
                            <span className="font-semibold">{item.score}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-400">Level:</span>
                            <span className="font-semibold">{item.knowledgeLevel}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-400">Date:</span>
                            <span className="text-gray-300">
                              {new Date(item.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {improvement !== 0 && (
                            <div className={`flex justify-between gap-3 pt-2 border-t border-gray-700 font-bold ${improvement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              <span>Change:</span>
                              <span>{improvement > 0 ? '↑' : '↓'} {Math.abs(improvement).toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-800 border-r border-b border-gray-700"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* X-axis label */}
                <div className="mt-3 text-center">
                  <div className="text-sm font-bold text-gray-700">#{item.attemptNumber}</div>
                  <div className="text-xs text-gray-500 font-medium">
                    {new Date(item.completedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                {/* Improvement badge */}
                {improvement > 0 && (
                  <div className="absolute -top-10 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-1 rounded-full shadow-lg animate-bounce">
                    ↑ +{improvement.toFixed(1)}%
                  </div>
                )}
                {improvement < 0 && (
                  <div className="absolute -top-10 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-600 px-3 py-1 rounded-full shadow-lg">
                    ↓ {improvement.toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md text-white">
          <div className="text-2xl font-bold">
            {data[data.length - 1].percentage}%
          </div>
          <div className="text-xs opacity-90">Latest Score</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md text-white">
          <div className="text-2xl font-bold">
            {data.length > 1 
              ? `${data[data.length - 1].percentage > data[0].percentage ? '+' : ''}${(data[data.length - 1].percentage - data[0].percentage).toFixed(1)}%`
              : '-'
            }
          </div>
          <div className="text-xs opacity-90">Total Improvement</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-md text-white">
          <div className="text-2xl font-bold">{data.length}</div>
          <div className="text-xs opacity-90">Attempts</div>
        </div>
      </div>
    </div>
  );
}
