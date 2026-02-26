import { useState, lazy, Suspense } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const AIAssistantChat = lazy(() => import('./AIAssistantChat'));

export default function FloatingAIChatButton() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  const handleClick = () => {
    setIsAIChatOpen(!isAIChatOpen);
    setShowPulse(false);
  };

  return (
    <>
      {isAIChatOpen && (
        <div className="fixed bottom-28 left-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] shadow-2xl rounded-xl overflow-hidden">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 z-10 h-7 w-7 bg-black/20 hover:bg-black/40 text-white rounded-full"
              onClick={() => setIsAIChatOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Suspense fallback={
              <Card className="h-[600px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </Card>
            }>
              <AIAssistantChat />
            </Suspense>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 left-6 z-50">
        <div className="relative">
          {showPulse && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 animate-ping opacity-75" />
          )}
          <Button
            size="lg"
            onClick={handleClick}
            className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 relative bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 border-2 border-white/20"
            aria-label="Open AI Assistant"
          >
            <div className="relative">
              <Bot className="h-7 w-7 text-white" />
              <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </Button>
          <Badge
            className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-xs px-2 py-0.5 shadow-lg animate-bounce"
          >
            AI
          </Badge>
        </div>
      </div>
    </>
  );
}
