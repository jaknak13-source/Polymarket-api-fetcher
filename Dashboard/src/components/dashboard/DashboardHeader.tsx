import { TrendingUp, Mail, MessageSquare, ExternalLink } from 'lucide-react';

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  isConnected: boolean;
}

export function DashboardHeader({ lastUpdated, isConnected }: DashboardHeaderProps) {
  return (
    <header className="glass-panel p-8 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold gradient-text tracking-tight">
              Polymarket Analytics
            </h1>
            <span className="alpha-badge">Alpha</span>
          </div>
          <p className="text-secondary-foreground text-base mb-3">
            Real-time market intelligence for Polymarket traders
          </p>
          
          {/* Intro description for alpha users */}
          <div className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Track live orderflow, whale activity, and market sentiment across prediction markets. 
            Data refreshes automatically every 8 seconds to keep you ahead of the curve.
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-4">
            <span 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success status-pulse' : 'bg-destructive'}`}
            />
            <span className={`text-sm ${isConnected ? 'text-success' : 'text-destructive'}`}>
              {isConnected 
                ? `Connected • Last updated: ${lastUpdated?.toLocaleTimeString() || 'Loading...'}`
                : 'Disconnected • Reconnecting...'}
            </span>
          </div>
        </div>

        {/* Feedback & Waitlist Section */}
        <div className="flex flex-col gap-3 min-w-[280px]">
          <div className="glass-panel p-4 border-primary/20">
            <p className="text-sm text-muted-foreground mb-3">
              <MessageSquare className="inline w-4 h-4 mr-1" />
              Help shape this tool – share feedback or feature requests
            </p>
            <div className="flex flex-wrap gap-2">
              <a 
                href="mailto:feedback@example.com?subject=Polymarket%20Analytics%20Feedback"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Email Feedback
              </a>
              <a 
                href="https://example.com/feedback"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Feedback Form
              </a>
            </div>
          </div>
          
          {/* Waitlist form */}
          <form 
            className="glass-panel p-4 border-primary/20"
            onSubmit={(e) => {
              e.preventDefault();
              // Placeholder - wire up to your backend later
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('waitlist-email') as HTMLInputElement)?.value;
              if (email) {
                alert(`Thanks! We'll notify ${email} about pro features.`);
                form.reset();
              }
            }}
          >
            <p className="text-sm text-muted-foreground mb-2">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              Get notified about pro features
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                name="waitlist-email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
