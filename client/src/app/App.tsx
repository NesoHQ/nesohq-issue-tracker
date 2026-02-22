import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ThemeProvider } from "next-themes";
import { SignIn } from "./components/SignIn";
import { OAuthCallback } from "./components/OAuthCallback";
import { Workspace } from "./components/Workspace";
import { authService } from "./lib/auth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = authService.getUser();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
