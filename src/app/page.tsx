// app/page.tsx
"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background-color">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-color/10 to-secondary-color/10" />
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-text-color mb-4">
            SurfAI
          </h1>
          <p className="text-xl text-text-color opacity-80 mb-8">
            Creative AI that generates amazing images & videos
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/generate"
              className="bg-primary-color text-primary-color px-8 py-3 rounded-md text-lg font-medium hover:bg-secondary-color transition duration-200"
            >
              Start Creating
            </Link>
            <Link
              href="/profile"
              className="text-primary-color border-2 border-primary-color px-8 py-3 rounded-md text-lg font-medium hover:bg-primary-color/10 transition duration-200"
            >
              My Creations
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-color text-center mb-12">
            What can SurfAI do?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 rounded-lg shadow-sm">
              <div className="text-4xl text-primary-color mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-text-color mb-2">
                Image Generation
              </h3>
              <p className="text-text-color opacity-80">
                Create stunning images from text prompts using advanced AI technology
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg shadow-sm">
              <div className="text-4xl text-primary-color mb-4">🎥</div>
              <h3 className="text-xl font-semibold text-text-color mb-2">
                Video Creation
              </h3>
              <p className="text-text-color opacity-80">
                Generate amazing videos with AI-powered animation and editing
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg shadow-sm">
              <div className="text-4xl text-primary-color mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-text-color mb-2">
                Fast & Easy
              </h3>
              <p className="text-text-color opacity-80">
                Simple interface and quick generation times make it easy to create
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-color/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4">
            <div className="text-3xl font-bold text-text-color">
              Ready to Create?
            </div>
            <div className="text-xl text-text-color opacity-80">
              Join thousands of creators who are using SurfAI to bring their ideas to life
            </div>
            <div className="mt-8">
              <Link
                href="/generate"
                className="inline-flex items-center justify-center px-10 py-4 text-2xl font-bold text-text-color bg-primary-color rounded-xl shadow-lg hover:bg-secondary-color transition-all duration-300 transform hover:scale-105"
              >
                Start Creating Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}