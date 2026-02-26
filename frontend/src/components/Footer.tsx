import { Heart, Mail } from 'lucide-react';

export default function Footer() {
  const appId = encodeURIComponent(window.location.hostname || 'pkg-tech-support');
  const caffeineUrl = `https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`;

  return (
    <footer className="border-t border-border/40 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/50 dark:via-cyan-950/50 dark:to-teal-950/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-inner">
      <div className="container py-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Mail className="h-4 w-4" />
            <span className="font-medium">Supported by:</span>
            <a
              href="mailto:praveenjaexperts@gmail.com"
              className="font-semibold bg-gradient-to-r from-blue-700 to-cyan-700 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent hover:underline"
            >
              praveenjaexperts@gmail.com
            </a>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with <Heart className="inline h-4 w-4 text-cyan-500 fill-cyan-500" /> using{' '}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
