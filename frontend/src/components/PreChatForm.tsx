import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface PreChatFormProps {
  open: boolean;
  onSubmit: (data: { name: string; email: string; topic: string }) => void;
  onCancel: () => void;
}

export default function PreChatForm({ open, onSubmit, onCancel }: PreChatFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !topic) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    onSubmit({ name: name.trim(), email: email.trim(), topic });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md bg-sky-50 dark:bg-sky-950">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Start a Support Chat</DialogTitle>
          <DialogDescription className="text-gray-700 dark:text-gray-300">
            Please provide some information before connecting with an expert
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic" className="text-gray-900 dark:text-gray-100">Inquiry Topic</Label>
            <Select value={topic} onValueChange={setTopic} required>
              <SelectTrigger id="topic" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hardware">Hardware Issues</SelectItem>
                <SelectItem value="software">Software Problems</SelectItem>
                <SelectItem value="network">Network & Connectivity</SelectItem>
                <SelectItem value="performance">Performance Issues</SelectItem>
                <SelectItem value="virus">Virus & Security</SelectItem>
                <SelectItem value="setup">Setup & Installation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Start Chat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
