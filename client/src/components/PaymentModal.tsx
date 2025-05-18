import { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PayPalButton from "@/components/PayPalButton";

export default function PaymentModal() {
  const { closeModal } = useModal();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvc, setCvc] = useState<string>("");
  const [nameOnCard, setNameOnCard] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const plans = {
    basic: { name: "Basic Plan", price: 9.99 },
    premium: { name: "Premium Plan", price: 19.99 },
    vip: { name: "VIP Plan", price: 39.99 }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !expiryDate || !cvc || !nameOnCard) {
      toast({
        title: "Missing information",
        description: "Please fill in all payment details",
        variant: "destructive"
      });
      return;
    }
    
    if (!agreedToTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Subscription Successful!",
        description: `You've successfully subscribed to the ${plans[selectedPlan as keyof typeof plans].name}!`,
      });
      closeModal();
    }, 2000);
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-dark-lighter rounded-xl shadow-xl relative mx-auto my-auto">
        {/* Prominent Close Button at Top Right */}
        <button 
          className="absolute top-3 right-3 z-10 bg-dark-card hover:bg-dark-lighter rounded-full p-2 text-light-dimmed hover:text-light transition-colors"
          onClick={closeModal}
          aria-label="Close payment modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Complete Your Subscription</h3>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[80vh]">
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">{plans[selectedPlan as keyof typeof plans].name}</h4>
            <p className="text-light-dimmed">${plans[selectedPlan as keyof typeof plans].price} per month</p>
            <div className="mt-2 text-sm text-light-dimmed">
              <p>Includes unlimited messaging, voice calls, and exclusive content.</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-light-dimmed text-sm mb-2 font-medium">Card Number</label>
              <input 
                type="text" 
                placeholder="1234 5678 9012 3456" 
                className="w-full bg-dark-card text-light rounded-lg px-4 py-3 outline-none border border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base" 
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                inputMode="numeric"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-light-dimmed text-sm mb-2 font-medium">Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  className="w-full bg-dark-card text-light rounded-lg px-4 py-3 outline-none border border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="block text-light-dimmed text-sm mb-2 font-medium">CVC</label>
                <input 
                  type="text" 
                  placeholder="123" 
                  className="w-full bg-dark-card text-light rounded-lg px-4 py-3 outline-none border border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base" 
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                  maxLength={3}
                  inputMode="numeric"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-light-dimmed text-sm mb-2 font-medium">Name on Card</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full bg-dark-card text-light rounded-lg px-4 py-3 outline-none border border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base" 
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
              />
            </div>
            
            <div className="flex items-start mb-6">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-4 h-4 mr-2 accent-primary"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)} 
                />
              </div>
              <label htmlFor="terms" className="text-light-dimmed text-sm ml-2">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>
            
            <button 
              type="submit" 
              className={`w-full ${isSubmitting 
                ? 'bg-primary-dark cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark'} text-white py-4 rounded-lg transition flex items-center justify-center font-medium text-base shadow-lg`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Subscribe Now"}
            </button>
            
            <div className="mt-8 border-t border-gray-800 pt-6">
              <div className="text-center mb-5 text-sm text-light-dimmed font-medium">
                <span>Or pay with</span>
              </div>
              
              {/* PayPal Button Component */}
              <div className="mx-auto max-w-sm">
                <PayPalButton
                  amount={plans[selectedPlan as keyof typeof plans].price.toString()}
                  currency="USD"
                  intent="CAPTURE"
                />
              </div>
              
              <div className="mt-4 flex items-center justify-center text-sm text-light-dimmed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Secure payment processed by PayPal</span>
              </div>
              
              {/* Cancel/Close button */}
              <button 
                type="button"
                onClick={closeModal}
                className="w-full mt-6 bg-dark-card hover:bg-dark-lighter text-light py-3 rounded-lg transition flex items-center justify-center font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
