import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";

export default function SubscriptionPlans() {
  const { openModal } = useModal();
  const { isPaid } = useAuth();

  return (
    <div className="mb-8">
      <h2 className="text-xl font-display font-semibold mb-4">Subscription Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <div className="subscription-card bg-dark-card rounded-xl overflow-hidden border border-gray-800">
          <div className="bg-dark-lighter p-4 text-center">
            <h3 className="text-lg font-semibold">Basic</h3>
            <p className="text-light-dimmed text-sm">Get Started</p>
          </div>
          <div className="p-6 flex flex-col">
            <div className="text-center mb-4">
              <p className="text-3xl font-semibold">$9.99<span className="text-light-dimmed text-sm"> / month</span></p>
              <p className="text-light-dimmed text-sm mt-1">Billed monthly</p>
            </div>
            <ul className="mb-6 space-y-2">
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Daily chat messages (50/day)</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Access to public photos</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Basic profile access</span>
              </li>
              <li className="flex items-start opacity-50">
                <i className="ri-close-line text-red-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Voice calls</span>
              </li>
              <li className="flex items-start opacity-50">
                <i className="ri-close-line text-red-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Exclusive content</span>
              </li>
            </ul>
            <button 
              className="mt-auto bg-dark-lighter hover:bg-secondary text-light hover:text-white transition py-2 rounded-lg"
              onClick={() => openModal('payment')}
            >
              Select Plan
            </button>
          </div>
        </div>
        
        {/* Premium Plan */}
        <div className="subscription-card bg-dark-card rounded-xl overflow-hidden border-2 border-primary relative">
          <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs rounded-bl-lg">
            POPULAR
          </div>
          <div className="bg-primary bg-opacity-10 p-4 text-center">
            <h3 className="text-lg font-semibold text-primary">Premium</h3>
            <p className="text-light-dimmed text-sm">Full Experience</p>
          </div>
          <div className="p-6 flex flex-col">
            <div className="text-center mb-4">
              <p className="text-3xl font-semibold">$19.99<span className="text-light-dimmed text-sm"> / month</span></p>
              <p className="text-light-dimmed text-sm mt-1">Billed monthly</p>
            </div>
            <ul className="mb-6 space-y-2">
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Unlimited daily messages</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Full photo gallery access</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Voice calls (20 mins/day)</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Exclusive videos weekly</span>
              </li>
              <li className="flex items-start opacity-50">
                <i className="ri-close-line text-red-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Priority responses</span>
              </li>
            </ul>
            <button 
              className={`mt-auto ${isPaid 
                ? 'bg-secondary-dark text-white cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark text-white'} transition py-2 rounded-lg`}
              onClick={() => !isPaid && openModal('payment')}
              disabled={isPaid}
            >
              {isPaid ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        </div>
        
        {/* VIP Plan */}
        <div className="subscription-card bg-dark-card rounded-xl overflow-hidden border border-gray-800">
          <div className="bg-secondary bg-opacity-10 p-4 text-center">
            <h3 className="text-lg font-semibold text-secondary-light">VIP</h3>
            <p className="text-light-dimmed text-sm">Ultimate Experience</p>
          </div>
          <div className="p-6 flex flex-col">
            <div className="text-center mb-4">
              <p className="text-3xl font-semibold">$39.99<span className="text-light-dimmed text-sm"> / month</span></p>
              <p className="text-light-dimmed text-sm mt-1">Billed monthly</p>
            </div>
            <ul className="mb-6 space-y-2">
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">All Premium features</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Unlimited voice calls</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Priority responses</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Custom photo requests</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-green-500 mr-2 mt-1"></i>
                <span className="text-light-dimmed">Early access to new content</span>
              </li>
            </ul>
            <button 
              className="mt-auto bg-secondary hover:bg-secondary-dark text-white transition py-2 rounded-lg"
              onClick={() => openModal('payment')}
            >
              Select Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
