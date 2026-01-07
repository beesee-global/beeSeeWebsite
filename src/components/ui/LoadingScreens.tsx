import { Loader2, RefreshCw, Sparkles, Zap } from 'lucide-react';
import React from 'react';

  // Loading Screen 1: Pulse Dots
export const PulseDotsLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center space-y-8">
        <div className="flex justify-center space-x-3">
          <div className="w-5 h-5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-5 h-5 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-5 h-5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Loading your content</h2>
          <p className="text-gray-600">Please wait while we prepare everything...</p>
        </div>
      </div>
    </div>
  );

  // Loading Screen 2: Spinning Ring
 export const SpinningRingLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="text-center space-y-8">
        <div className="relative inline-flex">
          <div className="w-24 h-24 border-8 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-8 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Just a moment</h2>
          <p className="text-gray-600">We're setting things up for you...</p>
        </div>
      </div>
    </div>
  );

  // Loading Screen 3: Progress Bar with Icon
 export const ProgressBarLoader = () => {
    const [progress, setProgress] = React.useState(0);
    
    React.useEffect(() => {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 10));
      }, 300);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-md w-full mx-6 text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-emerald-100 rounded-full p-6">
              <RefreshCw className="w-16 h-16 text-emerald-600 animate-spin" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Processing</h2>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-gray-600">Loading {progress}%</p>
          </div>
        </div>
      </div>
    );
  };

  // Loading Screen 4: Pulsing Card
 export const PulsingCardLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="bg-white rounded-3xl shadow-2xl p-12 mx-6 text-center space-y-8 animate-pulse">
        <div className="flex justify-center">
          <div className="bg-orange-100 rounded-full p-6">
            <Sparkles className="w-16 h-16 text-orange-600" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">Loading Experience</h2>
          <p className="text-gray-600">Preparing something amazing...</p>
        </div>
      </div>
    </div>
  );

  // Loading Screen 5: Orbiting Circles
 export const OrbitingCirclesLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50">
      <div className="text-center space-y-8">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-violet-600 rounded-full"></div>
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="w-4 h-4 bg-fuchsia-600 rounded-full absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
            <div className="w-4 h-4 bg-violet-500 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Hang tight</h2>
          <p className="text-gray-600">We're getting everything ready...</p>
        </div>
      </div>
    </div>
  );

  // Loading Screen 6: Minimal Icon Spin
 export const MinimalIconLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      <div className="text-center space-y-8">
        <Loader2 className="w-20 h-20 text-gray-700 animate-spin mx-auto" strokeWidth={2.5} />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Loading</h2>
          <p className="text-gray-600">This will only take a second...</p>
        </div>
      </div>
    </div>
  );

  // Loading Screen 7: Gradient Wave
 export const GradientWaveLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="text-center space-y-8">
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-12 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
          <div className="w-3 h-16 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '100ms', animationDuration: '1s' }}></div>
          <div className="w-3 h-20 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
          <div className="w-3 h-16 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms', animationDuration: '1s' }}></div>
          <div className="w-3 h-12 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Please wait</h2>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    </div>
  );

  // Loading Screen 8: Card with Skeleton
 export const SkeletonCardLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-red-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 space-y-8">
        <div className="flex justify-center">
          <Zap className="w-16 h-16 text-rose-600 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
        <div className="pt-4">
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );