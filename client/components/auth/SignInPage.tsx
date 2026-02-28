import { SignInForm } from './SignInForm';
import { SignInHero } from './SignInHero';

/**
 * Sign in page layout
 * Server component that composes client components
 */

export function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Hero section - could be server component */}
      <SignInHero />
      
      {/* Form section - client component for interactivity */}
      <SignInForm />
    </div>
  );
}
