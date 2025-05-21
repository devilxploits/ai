import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { useEffect, useState } from "react";
import { getSubscriptionPlans } from "@/lib/api";

// Types for subscription plans
interface SubscriptionPlan {
  id: number;
  name: string;
  tier: string;
  duration: string;
  price: number;
  featuresJson: string[];
  isActive: boolean;
}

export default function SubscriptionPlans() {
  const { openModal } = useModal();
  const { isPaid, user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription plans from the API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const fetchedPlans = await getSubscriptionPlans(true);
        
        // Sort plans by price
        const sortedPlans = fetchedPlans.sort((a, b) => a.price - b.price);
        setPlans(sortedPlans);
        setError(null);
      } catch (err) {
        console.error("Error fetching subscription plans:", err);
        setError("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Function to format price for display
  const formatPrice = (price: number, duration: string) => {
    const dollars = (price / 100).toFixed(2); // Convert cents to dollars
    
    // Determine billing period text
    let billingPeriod = "Billed monthly";
    let durationText = "/ month";
    
    switch (duration) {
      case "week":
        billingPeriod = "Billed weekly";
        durationText = "/ week";
        break;
      case "month":
        billingPeriod = "Billed monthly";
        durationText = "/ month";
        break;
      case "6month":
        billingPeriod = "Billed every 6 months";
        durationText = "/ 6 months";
        break;
      case "year":
        billingPeriod = "Billed yearly";
        durationText = "/ year";
        break;
    }
    
    return { 
      priceDisplay: `$${dollars}`,
      durationText,
      billingPeriod
    };
  };

  // Function to determine if user is currently subscribed to this plan
  const isCurrentPlan = (tier: string) => {
    return isPaid && user?.subscriptionTier === tier;
  };
  
  // Get background color based on tier
  const getTierStyles = (tier: string) => {
    switch (tier) {
      case "basic":
        return {
          headerBg: "bg-dark-lighter",
          headerText: "text-lg font-semibold",
          border: "border border-gray-800",
          buttonBg: "bg-dark-lighter hover:bg-secondary text-light hover:text-white"
        };
      case "premium":
        return {
          headerBg: "bg-primary bg-opacity-10",
          headerText: "text-lg font-semibold text-primary",
          border: "border-2 border-primary",
          buttonBg: "bg-primary hover:bg-primary-dark text-white"
        };
      case "vip":
        return {
          headerBg: "bg-secondary bg-opacity-10",
          headerText: "text-lg font-semibold text-secondary-light",
          border: "border border-gray-800",
          buttonBg: "bg-secondary hover:bg-secondary-dark text-white"
        };
      default:
        return {
          headerBg: "bg-dark-lighter",
          headerText: "text-lg font-semibold",
          border: "border border-gray-800",
          buttonBg: "bg-dark-lighter hover:bg-secondary text-light hover:text-white"
        };
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-display font-semibold mb-4">Subscription Plans</h2>
        <div className="text-center py-10">
          <div className="animate-pulse">
            <div className="h-4 bg-dark-lighter rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-dark-lighter rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-display font-semibold mb-4">Subscription Plans</h2>
        <div className="text-center py-10 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // If no plans are available, show a fallback message
  if (plans.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-display font-semibold mb-4">Subscription Plans</h2>
        <div className="text-center py-10 text-light-dimmed">
          <p>No subscription plans are currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-display font-semibold mb-4">Subscription Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const { priceDisplay, durationText, billingPeriod } = formatPrice(plan.price, plan.duration);
          const tierStyles = getTierStyles(plan.tier);
          const currentPlan = isCurrentPlan(plan.tier);
          const isPremium = plan.tier === "premium";
          
          return (
            <div 
              key={plan.id} 
              className={`subscription-card bg-dark-card rounded-xl overflow-hidden ${tierStyles.border} ${isPremium ? 'relative' : ''}`}
            >
              {isPremium && (
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <div className={`${tierStyles.headerBg} p-4 text-center`}>
                <h3 className={tierStyles.headerText}>{plan.name}</h3>
                <p className="text-light-dimmed text-sm">{plan.tier === "basic" ? "Get Started" : plan.tier === "premium" ? "Full Experience" : "Ultimate Experience"}</p>
              </div>
              <div className="p-6 flex flex-col">
                <div className="text-center mb-4">
                  <p className="text-3xl font-semibold">{priceDisplay}<span className="text-light-dimmed text-sm"> {durationText}</span></p>
                  <p className="text-light-dimmed text-sm mt-1">{billingPeriod}</p>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.featuresJson.map((feature, index) => {
                    const isIncluded = !feature.startsWith("!"); // Features starting with ! are not included
                    const featureText = isIncluded ? feature : feature.substring(1);
                    
                    return (
                      <li key={index} className={`flex items-start ${!isIncluded ? 'opacity-50' : ''}`}>
                        <i className={`${isIncluded ? 'ri-check-line text-green-500' : 'ri-close-line text-red-500'} mr-2 mt-1`}></i>
                        <span className="text-light-dimmed">{featureText}</span>
                      </li>
                    );
                  })}
                </ul>
                <button 
                  className={`mt-auto ${currentPlan 
                    ? 'bg-secondary-dark text-white cursor-not-allowed' 
                    : tierStyles.buttonBg} transition py-2 rounded-lg`}
                  onClick={() => !currentPlan && openModal('payment')}
                  disabled={currentPlan}
                >
                  {currentPlan ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
