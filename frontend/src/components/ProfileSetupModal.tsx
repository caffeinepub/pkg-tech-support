import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Wrench, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isTechnician, setIsTechnician] = useState(false);
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        displayName: displayName.trim(),
        isTechnician,
        avatar: undefined,
      });

      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile');
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Welcome to PKG Tech Support</DialogTitle>
          <DialogDescription className="text-center">
            Please set up your profile to get started
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Your Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={saveProfile.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saveProfile.isPending}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>I am a:</Label>
            <RadioGroup
              value={isTechnician ? 'technician' : 'customer'}
              onValueChange={(value) => setIsTechnician(value === 'technician')}
              disabled={saveProfile.isPending}
            >
              <div className="flex items-center space-x-3 rounded-lg border-2 border-teal-200 dark:border-teal-800 p-4 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors cursor-pointer">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer" className="flex items-center gap-2 cursor-pointer flex-1">
                  <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">Customer</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border-2 border-purple-200 dark:border-purple-800 p-4 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors cursor-pointer">
                <RadioGroupItem value="technician" id="technician" />
                <Label htmlFor="technician" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">Technical Expert</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
