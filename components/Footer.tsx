"use client";

import Link from "next/link";
import { Clapperboard, Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-zinc-900 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href="/" className="group flex items-center gap-2 font-bold text-xl transition-all">
            <Clapperboard className="h-7 w-7 text-purple-500 transition-transform duration-300 group-hover:rotate-12" />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent tracking-tight text-2xl font-black">
              MyShows
            </span>
          </Link>
          <p className="text-zinc-400 leading-relaxed">
            Experience the future of cinema booking. Seamless, real-time, and premium movie experiences at your fingertips.
          </p>
          <div className="flex gap-4">
            <a href="#" className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-purple-600 transition-all duration-300 border border-zinc-800">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-purple-600 transition-all duration-300 border border-zinc-800">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-purple-600 transition-all duration-300 border border-zinc-800">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-purple-600 transition-all duration-300 border border-zinc-800">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold">Quick Links</h4>
          <ul className="space-y-4 text-zinc-400">
            <li><Link href="/" className="hover:text-purple-400 transition-colors">Home</Link></li>
            <li><Link href="/movies" className="hover:text-purple-400 transition-colors">All Movies</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition-colors">Latest Trailers</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold">Recommended</h4>
          <ul className="space-y-4 text-zinc-400">
            <li><Link href="#" className="hover:text-purple-400 transition-colors">Action Movies</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition-colors">Sci-Fi Hits</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition-colors">IMAX Experience</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition-colors">New Releases</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold">Contact Us</h4>
          <ul className="space-y-4 text-zinc-400">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-purple-500 shrink-0" />
              <span>123 Cinema Plaza, Film City, CA 90210</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-purple-500 shrink-0" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-purple-500 shrink-0" />
              <span>support@myshows.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm italic">
        <p>© {new Date().getFullYear()} MyShows Cinema. All rights reserved.</p>
        <div className="flex gap-8">
          <Link href="#" className="hover:text-white transition-colors underline decoration-purple-500/30">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors underline decoration-purple-500/30">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
