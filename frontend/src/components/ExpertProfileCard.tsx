import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Circle } from 'lucide-react';
import { UserProfile } from '../backend';

interface ExpertProfileCardProps {
  profile: UserProfile;
  isOnline: boolean;
}

export default function ExpertProfileCard({ profile, isOnline }: ExpertProfileCardProps) {
  const avatarUrl = profile.avatar?.getDirectURL();
  
  return (
    <Card className="border-b rounded-none">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={profile.displayName} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            {isOnline && (
              <Circle className="absolute -bottom-1 -right-1 h-4 w-4 fill-green-500 text-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{profile.displayName}</h3>
            <p className="text-sm text-muted-foreground">Technical Support Expert</p>
            <Badge variant={isOnline ? 'default' : 'secondary'} className="mt-1 text-xs">
              <Circle className={`h-2 w-2 mr-1 ${isOnline ? 'fill-green-500 text-green-500' : 'fill-gray-500 text-gray-500'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
