import { MessageSquare, CreditCard, Headphones, UserCircle, Wrench, Shield, Zap, Bot, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';

export default function LoginPrompt() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <img 
          src="/assets/generated/premium-gradient-background.dim_1200x600.png" 
          alt="" 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      
      <div className="container py-12 md:py-24 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="mb-8 relative">
              <img
                src="/assets/generated/tech-setup.dim_600x400.jpg"
                alt="Technical Support"
                className="mx-auto rounded-2xl shadow-2xl max-w-full h-auto border-4 border-white dark:border-gray-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-cyan-900/50 to-transparent rounded-2xl flex items-end justify-center pb-8">
                <div className="text-white text-center">
                  <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                    PKG Tech Support
                  </h1>
                  <p className="text-lg md:text-xl drop-shadow-lg">
                    Professional Support at Your Fingertips
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-700 via-cyan-700 to-teal-700 dark:from-blue-300 dark:via-cyan-300 dark:to-teal-300 bg-clip-text text-transparent">
              Professional Technical Support for Your Devices
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300 mb-4">
              Get expert help for your laptop and desktop issues. Connect with certified technicians in real-time.
            </p>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold px-4 py-2 text-sm shadow-lg">
              <Bot className="h-4 w-4 mr-2" />
              NEW: AI Assistant Available 24/7
              <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
            </Badge>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-center text-blue-800 dark:text-blue-200">Real-Time Chat</h3>
                <p className="text-sm text-center text-blue-700 dark:text-blue-300">
                  Connect instantly with support technicians through our live chat interface
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-cyan-200 dark:border-cyan-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-center text-cyan-800 dark:text-cyan-200">Expert Technicians</h3>
                <p className="text-sm text-center text-cyan-700 dark:text-cyan-300">
                  Certified professionals ready to solve your technical problems
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-center text-teal-800 dark:text-teal-200">Secure Payments</h3>
                <p className="text-sm text-center text-teal-700 dark:text-teal-300">
                  Pay safely for support services with integrated payment processing
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-xs rounded-bl-lg rounded-tr-lg px-2 py-1">
                  NEW
                </Badge>
              </div>
              <CardContent className="pt-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg relative">
                  <Bot className="h-8 w-8 text-white" />
                  <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h3 className="font-semibold mb-2 text-center text-blue-800 dark:text-blue-200">AI Assistant</h3>
                <p className="text-sm text-center text-blue-700 dark:text-blue-300">
                  Get instant AI-powered support available 24/7
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xl bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 flex items-center justify-center shadow-lg">
                  <UserCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-700 to-cyan-700 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
                  Customer Login
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Get help from expert technicians for your technical issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>View available experts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Start real-time chat sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Share screenshots and images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Access AI assistant 24/7</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 shadow-lg" 
                  size="lg"
                  onClick={() => navigate({ to: '/customer-login' })}
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Login as Customer
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-violet-300 dark:border-violet-700 hover:border-violet-500 dark:hover:border-violet-500 transition-all shadow-xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-violet-700 to-purple-700 dark:from-violet-300 dark:to-purple-300 bg-clip-text text-transparent">
                  Expert Login
                </CardTitle>
                <CardDescription className="text-violet-700 dark:text-violet-300">
                  Help customers solve their technical problems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-violet-700 dark:text-violet-300 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-0.5">✓</span>
                    <span>Manage incoming chat requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-0.5">✓</span>
                    <span>Respond to customers in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-0.5">✓</span>
                    <span>Share helpful screenshots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-0.5">✓</span>
                    <span>Track support history</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 shadow-lg" 
                  size="lg"
                  onClick={() => navigate({ to: '/expert-login' })}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Login as Expert
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
