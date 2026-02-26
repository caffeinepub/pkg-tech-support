import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetUserTickets } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import ProactiveChatInvitation from './ProactiveChatInvitation';

export default function FloatingChatButton() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: tickets = [] } = useGetUserTickets();
  const navigate = useNavigate();
  const [showInvitation, setShowInvitation] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const isAuthenticated = !!identity;
  const hasActiveTickets = tickets.length > 0;
  const unreadCount = 0; // Could be enhanced with actual unread message tracking

  // Proactive chat invitation after 10 seconds of inactivity
  useEffect(() => {
    if (!isAuthenticated || hasInteracted || userProfile?.isTechnician) {
      return;
    }

    const timer = setTimeout(() => {
      setShowInvitation(true);
    }, 10000); // 10 seconds

    const handleActivity = () => {
      setHasInteracted(true);
      clearTimeout(timer);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isAuthenticated, hasInteracted, userProfile]);

  const handleClick = () => {
    setHasInteracted(true);
    setShowInvitation(false);
    
    if (!isAuthenticated) {
      navigate({ to: '/customer-login' });
    } else {
      navigate({ to: '/' });
      // Scroll to chat section if on home page
      setTimeout(() => {
        const chatSection = document.querySelector('[data-chat-section]');
        if (chatSection) {
          chatSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleDismissInvitation = () => {
    setShowInvitation(false);
    setHasInteracted(true);
  };

  // Don't show for experts
  if (userProfile?.isTechnician) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {showInvitation && (
          <ProactiveChatInvitation onDismiss={handleDismissInvitation} onAccept={handleClick} />
        )}
        
        <Button
          size="lg"
          onClick={handleClick}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
          {hasActiveTickets && unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    </>
  );
}
