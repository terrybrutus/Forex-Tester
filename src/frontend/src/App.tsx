import { Header } from "./components/Header";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
      <Header />
      <main className="flex-1">
        <DashboardPage />
      </main>
      <footer className="bg-card border-t border-border py-4 px-6 text-sm text-muted-foreground">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span>
            © {new Date().getFullYear()}. Built with love using caffeine.ai
          </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
