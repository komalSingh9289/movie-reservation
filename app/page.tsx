import Link from "next/link";
import { Button } from "@/components/ui/button";
import { movies } from "@/data/movies";
import { Play, Calendar, Star, MoveRight } from "lucide-react";

export default function Home() {
  const displayedMovies = movies.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            Now Streaming: Latest Blockbusters
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Experience Cinema <br /> <span className="text-pink-400">Like Never Before</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Book your tickets in seconds with our real-time seat locking system. 
            No more waiting, just seamless movie magic.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link href="/movies">
              <Button size="lg" className="h-14 px-8 text-lg bg-purple-600 hover:bg-purple-700 rounded-full group">
                Book Tickets Now
                <Play className="ml-2 h-5 w-5 fill-current" />
              </Button>
            </Link>
            <Link href="/movies">
            <Button variant="default" size="lg" className="h-14 px-8 text-lg border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 rounded-full">
              Browse Movies
            </Button>
            </Link>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Trending Movies Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold">Trending Movies</h2>
            <div className="h-1.5 w-20 bg-purple-600 rounded-full" />
          </div>
          <Link href="/movies" className="text-purple-400 hover:text-purple-300 flex items-center gap-2 font-medium group">
            Show all movies
            <MoveRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedMovies.map((movie) => (
            <div key={movie.id} className="group relative flex flex-col bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5">
              <div className="overflow-hidden relative">
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                  {movie.rating || "8.5"}
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">{movie.category || "Sci-Fi"}</span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {movie.duration}
                  </span>
                </div>
                <h3 className="text-sm font-bold group-hover:text-purple-400 transition-colors line-clamp-1">{movie.title}</h3>
                
                <Link href={`/movies/${movie.id}`} className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs bg-zinc-800 hover:bg-purple-600 hover:text-white transition-colors">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Watch Trailer Section - Collage Layout */}
      <section className="py-24 px-6 bg-zinc-950/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl md:text-5xl font-bold">Watch Trailers</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Get a glimpse of the most anticipated movies of the season.</p>
            <div className="h-1.5 w-24 bg-purple-600 rounded-full mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px] md:h-[700px] p-24 sm:p-12">
            {/* Primary Trailer (Large) */}
            <div className="md:col-span-7 relative group cursor-pointer overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
              <img 
                src={`https://img.youtube.com/vi/${movies[0].trailerId}/maxresdefault.jpg`} 
                alt={movies[0].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <a 
                  href={`https://www.youtube.com/watch?v=${movies[0].trailerId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-20 w-20 rounded-full bg-white text-black flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors shadow-xl"
                >
                  <Play className="h-8 w-8 fill-current ml-1" />
                </a>
              </div>
              <div className="absolute bottom-8 left-8 space-y-2">
                <span className="px-3 py-1 rounded-full bg-purple-600 text-xs font-bold uppercase tracking-widest text-white">Trending Now</span>
                <h3 className="text-3xl md:text-4xl font-black text-white">{movies[0].title} Official Trailer</h3>
              </div>
            </div>

            {/* Side Column Trailers */}
            <div className="md:col-span-5 grid grid-rows-2 gap-4 h-full">
              {/* Secondary Trailer 1 */}
              <div className="relative group cursor-pointer overflow-hidden rounded-3xl border border-white/5 shadow-xl">
                <img 
                  src={`https://img.youtube.com/vi/${movies[1].trailerId}/maxresdefault.jpg`} 
                  alt={movies[1].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <a 
                    href={`https://www.youtube.com/watch?v=${movies[1].trailerId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-purple-600 transition-colors"
                  >
                    <Play className="h-6 w-6 fill-current ml-1" />
                  </a>
                </div>
                <div className="absolute bottom-6 left-6">
                  <h4 className="text-xl font-bold text-white">{movies[1].title}</h4>
                  <p className="text-sm text-zinc-300">New Release • Watch Trailer</p>
                </div>
              </div>

              {/* Secondary Trailer 2 */}
              <div className="relative group cursor-pointer overflow-hidden rounded-3xl border border-white/5 shadow-xl">
                <img 
                  src={`https://img.youtube.com/vi/${movies[2].trailerId}/maxresdefault.jpg`} 
                  alt={movies[2].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <a 
                    href={`https://www.youtube.com/watch?v=${movies[2].trailerId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-purple-600 transition-colors"
                  >
                    <Play className="h-6 w-6 fill-current ml-1" />
                  </a>
                </div>
                <div className="absolute bottom-6 left-6">
                  <h4 className="text-xl font-bold text-white">{movies[2].title}</h4>
                  <p className="text-sm text-zinc-300">Exclusive Look • Watch Trailer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-800 pt-16">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-600/20 flex items-center justify-center">
            <Star className="h-6 w-6 text-purple-500" />
          </div>
          <h4 className="text-xl font-bold">Premium Experience</h4>
          <p className="text-zinc-400">Enjoy movies in 4K resolution with immersive Dolby Atmos sound systems.</p>
        </div>
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-600/20 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-pink-500" />
          </div>
          <h4 className="text-xl font-bold">Easy Booking</h4>
          <p className="text-zinc-400">Pick your favorite seats and book instantly with our real-time locking system.</p>
        </div>
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/20 flex items-center justify-center">
            <Play className="h-6 w-6 text-blue-500" />
          </div>
          <h4 className="text-xl font-bold">Exclusive Content</h4>
          <p className="text-zinc-400">Get access to early premieres and exclusive behind-the-scenes content.</p>
        </div>
      </section>

      {/* Footer / CTA Section */}
      <section className="py-24 bg-gradient-to-b from-black to-zinc-950 px-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to watch?</h2>
          <p className="text-xl text-zinc-400">Book your tickets now and enjoy the movie experience.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 h-14 px-10 text-lg rounded-full">
              Book Tickets Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}



