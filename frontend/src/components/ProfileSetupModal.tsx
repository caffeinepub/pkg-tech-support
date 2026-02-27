import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Loader2, Sparkles } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function ProfileSetupModal({ isOpen, onComplete }: ProfileSetupModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (displayName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    try {
      await saveProfile.mutateAsync({
        displayName: displayName.trim(),
        isTechnician: false,
        avatar: undefined,
      });
      onComplete();
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-md rounded-2xl border-2 shadow-modal"
        style={{
          background: 'var(--modal-bg)',
          borderColor: 'var(--primary)',
        }}
      >
        <DialogHeader className="text-center pb-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Sparkles className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-display font-bold" style={{ color: 'var(--foreground)' }}>
            Welcome to PKG Tech Support
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--muted-foreground)' }}>
            Let's set up your profile to get started with expert support.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Your Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 rounded-xl border-2 transition-colors focus:border-primary"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                maxLength={100}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm font-medium" style={{ color: 'var(--destructive)' }}>
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={saveProfile.isPending || !displayName.trim()}
            className="w-full rounded-xl py-3 font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Setting up...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
