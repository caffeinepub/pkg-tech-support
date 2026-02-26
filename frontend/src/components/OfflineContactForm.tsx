import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Clock } from 'lucide-react';

export default function OfflineContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !topic || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission (in real app, this would save to backend)
    setTimeout(() => {
      toast.success('Your inquiry has been submitted! We\'ll get back to you soon.');
      setName('');
      setEmail('');
      setTopic('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card className="max-w-2xl mx-auto bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
          <img 
            src="/assets/generated/offline-support-icon.dim_64x64.png" 
            alt="Offline" 
            className="h-10 w-10"
          />
        </div>
        <CardTitle className="text-gray-900 dark:text-gray-100">All Experts Are Currently Offline</CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-300">
          Leave your inquiry and we'll get back to you as soon as possible
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-start gap-3">
          <Clock className="h-5 w-5 text-gray-700 dark:text-gray-300 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">Expected Response Time</p>
            <p className="text-gray-700 dark:text-gray-300">
              We typically respond within 2-4 hours during business hours (9 AM - 6 PM EST)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offline-name" className="text-gray-900 dark:text-gray-100">Name *</Label>
              <Input
                id="offline-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offline-email" className="text-gray-900 dark:text-gray-100">Email *</Label>
              <Input
                id="offline-email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offline-topic" className="text-gray-900 dark:text-gray-100">Issue Category *</Label>
            <Select value={topic} onValueChange={setTopic} required>
              <SelectTrigger id="offline-topic" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select a category" />
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

          <div className="space-y-2">
            <Label htmlFor="offline-message" className="text-gray-900 dark:text-gray-100">Describe Your Issue *</Label>
            <Textarea
              id="offline-message"
              placeholder="Please provide details about your technical issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Mail className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
