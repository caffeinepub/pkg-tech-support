import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';

interface ProactiveChatInvitationProps {
  onDismiss: () => void;
  onAccept: () => void;
}

export default function ProactiveChatInvitation({ onDismiss, onAccept }: ProactiveChatInvitationProps) {
  return (
    <Card className="w-80 shadow-xl animate-in slide-in-from-bottom-5 duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Need help?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Our technical experts are here to assist you with any issues.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={onAccept} className="flex-1">
                Start Chat
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
