import { useCreateSupportCheckoutSession, useIsStripeConfigured } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreditCard, AlertCircle, DollarSign, CheckCircle, Shield, Zap, Smartphone, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSection() {
  const { data: isConfigured = false, isLoading: configLoading } = useIsStripeConfigured();
  const createCheckout = useCreateSupportCheckoutSession();

  const handlePayment = async () => {
    try {
      const session = await createCheckout.mutateAsync();
      window.location.href = session.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error(error);
    }
  };

  if (configLoading) {
    return (
      <Card className="shadow-xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payment options...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConfigured) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Alert className="border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100">Payment Functionality Not Available</AlertTitle>
          <AlertDescription className="text-base mt-2 text-amber-800 dark:text-amber-200">
            Payment functionality will be available once Stripe is configured. Please contact the administrator to set up payment processing.
          </AlertDescription>
        </Alert>

        <Card className="opacity-60 pointer-events-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-2xl">Technical Support Payment</CardTitle>
            <CardDescription className="text-base">
              Support payment will be available after Stripe configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <CreditCard className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-2">Payments Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our secure payment system powered by Stripe will be available shortly. You'll be able to purchase technical support seamlessly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="border-2 border-cyan-200 dark:border-cyan-800 shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300 rounded-3xl bg-white dark:bg-gray-900">
        <CardHeader className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 dark:from-cyan-800 dark:via-blue-800 dark:to-teal-800 border-b-2 border-cyan-400 dark:border-cyan-700 py-8">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)',
            }}></div>
          </div>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-3">
              <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
              <CardTitle className="text-3xl md:text-4xl text-white font-bold drop-shadow-lg">
                Technical Support Payment
              </CardTitle>
              <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
            </div>
            <CardDescription className="text-lg md:text-xl text-white/95 font-medium mt-2 drop-shadow-md">
              Professional laptop and desktop assistance — $1 per support session
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Panel - Payment Info with Background */}
            <div className="relative min-h-[700px] overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-teal-950/30">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img
                  src="/assets/pytm.jpg"
                  alt="Payment Background"
                  className="w-full h-full object-cover opacity-10 dark:opacity-5"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-cyan-50/90 to-blue-50/85 dark:from-gray-900/95 dark:via-cyan-950/90 dark:to-blue-950/85"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col justify-center h-full">
                <div className="space-y-6">
                  {/* Pricing Card */}
                  <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-600 dark:from-cyan-700 dark:via-blue-700 dark:to-teal-700 rounded-3xl p-8 shadow-2xl border-4 border-cyan-300 dark:border-cyan-800 transform hover:scale-105 transition-transform duration-300">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
                        <DollarSign className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Service Fee</h3>
                    </div>
                    
                    <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-white/20">
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-8xl font-black text-white drop-shadow-2xl">$1</span>
                        <span className="text-3xl font-bold text-white/95">USD</span>
                      </div>
                      <p className="text-2xl font-black text-white/95 uppercase tracking-wider drop-shadow-md">
                        Per Technical Issue
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 group">
                        <CheckCircle className="h-6 w-6 text-white flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform drop-shadow-md" />
                        <p className="text-white font-semibold text-base drop-shadow-sm">Professional technical support</p>
                      </div>
                      <div className="flex items-start gap-3 group">
                        <CheckCircle className="h-6 w-6 text-white flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform drop-shadow-md" />
                        <p className="text-white font-semibold text-base drop-shadow-sm">Real-time chat with experts</p>
                      </div>
                      <div className="flex items-start gap-3 group">
                        <CheckCircle className="h-6 w-6 text-white flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform drop-shadow-md" />
                        <p className="text-white font-semibold text-base drop-shadow-sm">Laptop & desktop assistance</p>
                      </div>
                      <div className="flex items-start gap-3 group">
                        <CheckCircle className="h-6 w-6 text-white flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform drop-shadow-md" />
                        <p className="text-white font-semibold text-base drop-shadow-sm">Image sharing & screenshots</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-2 border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 flex items-center justify-center shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Payment Instructions</h4>
                    </div>
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                      <p className="text-base font-medium leading-relaxed">
                        <strong className="text-cyan-700 dark:text-cyan-300">Scan to Pay</strong> or <strong className="text-cyan-700 dark:text-cyan-300">Click Pay Now</strong> to proceed securely
                      </p>
                      <p className="text-sm leading-relaxed">
                        Choose your preferred payment method: Use the QR code on the right for mobile payment apps, or click the "Pay Now" button below for secure Stripe checkout.
                      </p>
                    </div>
                  </div>

                  {/* Pay Now Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={createCheckout.isPending}
                    className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 dark:from-cyan-700 dark:via-blue-700 dark:to-teal-700 dark:hover:from-cyan-800 dark:hover:via-blue-800 dark:hover:to-teal-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg font-bold py-7 rounded-2xl"
                    size="lg"
                  >
                    {createCheckout.isPending ? (
                      <>
                        <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary-foreground border-t-transparent mr-3" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-6 w-6 mr-3" />
                        Pay Now (Stripe Checkout)
                      </>
                    )}
                  </Button>

                  {/* Secure Payment Badge */}
                  <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
                    <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Secure payments — Supported by praveenjaexperts@gmail.com</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">Protected by Stripe encryption</p>
                    </div>
                  </div>

                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium">
                    🔒 You will be redirected to Stripe's secure checkout page
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel - QR Code Payment */}
            <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center border-l-2 border-cyan-200 dark:border-cyan-800 relative overflow-hidden min-h-[700px]">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              <div className="relative z-10 space-y-8 text-center w-full max-w-md">
                {/* Header */}
                <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-100 via-blue-100 to-teal-100 dark:from-cyan-900/50 dark:via-blue-900/50 dark:to-teal-900/50 px-8 py-4 rounded-full border-3 border-cyan-300 dark:border-cyan-700 shadow-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-cyan-900 dark:text-cyan-100">QR / UPI Payment</h3>
                </div>
                
                {/* QR Code Image */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-4 border-cyan-300 dark:border-cyan-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                  <img
                    src="/assets/Screenshot_2025-12-28-11-07-00-174_com.phonepe.app.jpg"
                    alt="Scan to Pay QR Code"
                    className="w-full max-w-[350px] h-auto object-contain mx-auto rounded-2xl"
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="text-center py-12"><p class="text-gray-500">QR Code Image Not Available</p></div>';
                    }}
                  />
                </div>
                
                {/* Instructions */}
                <div className="space-y-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-200 dark:border-cyan-800 shadow-lg">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                      Instant Payment
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-cyan-900 dark:text-cyan-100">
                    Quick Payment Option
                  </h4>
                  
                  <p className="text-base text-cyan-800 dark:text-cyan-200 leading-relaxed font-medium">
                    Scan this QR code with your mobile payment app (PhonePe, Google Pay, Paytm, UPI, etc.) for instant payment processing
                  </p>

                  <div className="pt-4 border-t-2 border-cyan-200 dark:border-cyan-800">
                    <p className="text-sm text-cyan-700 dark:text-cyan-300 font-semibold leading-relaxed">
                      ✓ Secure & Fast Payment<br/>
                      ✓ No Registration Required<br/>
                      ✓ Instant Confirmation<br/>
                      ✓ All UPI Apps Supported
                    </p>
                  </div>
                </div>

                {/* Secure Payment Icon */}
                <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 rounded-xl p-3 border border-cyan-200 dark:border-cyan-800">
                  <Shield className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  <p className="text-sm font-bold text-cyan-800 dark:text-cyan-200">
                    Secure Payment Gateway
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
