import Image from 'next/image';
import { Github } from 'lucide-react';

/**
 * Sign in hero section
 * Server component - no interactivity needed
 */

const features = [
  {
    title: 'Multi-repository view',
    description: 'See all your issues in one place',
  },
  {
    title: 'Advanced filtering',
    description: 'Find exactly what you need',
  },
  {
    title: 'Rich editing experience',
    description: 'Markdown support with live preview',
  },
];

export function SignInHero() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBwYXR0ZXJufGVufDF8fHx8MTc3MTY2NjExOXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-primary-foreground">
          <Github className="size-8" />
          <span className="text-2xl font-semibold">NesOHQ Issue Tracker</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6">
        <h1 className="text-4xl font-bold text-primary-foreground">
          Manage your GitHub issues with ease
        </h1>
        <p className="text-lg text-primary-foreground/90">
          Track, organize, and collaborate on issues across all your repositories in one unified workspace.
        </p>

        {/* Features */}
        <div className="flex flex-col gap-4 pt-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3 text-primary-foreground/90">
              <div className="size-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <div>
                <div className="font-medium">{feature.title}</div>
                <div className="text-sm opacity-80">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
