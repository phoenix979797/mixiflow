import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PaymentModal from './PaymentModal';
import backendAxios from '../utils/backendAxios';
import { useToast } from '../context/ToastContext';

const MAISubscribe = () => {
  const [selectedTasks, setSelectedTasks] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [planData, setPlanData] = useState(null);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const toggleTasks = (value) => {
    setSelectedTasks(selectedTasks === value ? null : value);
  };

  const calculateTotal = () => {
    const basePrice = 19;
    const tasksPricing = {
      '1000': 10,
      '2000': 30,
      '3000': 60,
      'unlimited': 99
    };

    return basePrice + (selectedTasks ? tasksPricing[selectedTasks] : 0);
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Create payment intent on your backend
      const response = await backendAxios.post('/payment/stripe', {
        tasksLimit: selectedTasks || '500',
        workSpaceLimit: '0',
        appsLimit: '0',
        planType: 'mAI',
      });
      const { clientSecret, price } = response.data;

      setPlanData({
        tasksLimit: selectedTasks || '500',
        workSpaceLimit: '0',
        appsLimit: '0', 
        planType: 'mAI',
        price: Number(price),
        clientSecret: clientSecret
      });

      setShowPaymentModal(true);
    } catch (error) {
      showToast(error.response.data.message, "error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mb-4">
        <Link 
          to="/create-plan" 
          className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <span className="mr-2">←</span> Back to Create Plan
        </Link>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 md:h-[calc(100vh-10rem)]">

        <div className="md:hidden bg-black text-white p-6 rounded-lg space-y-4">

          <div className="space-y-2">
            <h2 className="text-xl text-left">Subscribe to mAI</h2>
            <div className="flex items-center space-x-6 justify-start">
              <h1 className="text-6xl font-bold">${calculateTotal()}</h1>
              <div>
                <p className="text-ms text-left">Per month</p>
                <p className="text-ms text-left">Cancel anytime</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">

            <div className="flex flex-col items-center">
              <img src="/assets/icons/icon_tstar.png" alt="mAI icon" className="text-xl w-12 h-12" />
              <div>
                <p className="text-xs font-medium">Powerful</p>
                <p className="text-xs">mAI features</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <img src="/assets/icons/icon_check_white.png" alt="Tasks icon" className="text-xl w-12 h-12" />
              <div>
                <p className="text-xs font-medium">{selectedTasks || '500'} tasks</p>
                <p className="text-xs">Per month</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <img src="/assets/icons/icon_a.png" alt="Apps icon" className="text-xl w-12 h-12" />
              <div>
                <p className="text-xs">App</p>
                <p className="text-xs">Actions</p>
              </div>
            </div>

          </div>

        </div>
        
        <div className="bg-black text-white p-8 rounded-lg space-y-8 hidden md:block">

          <div className="space-y-2">
            <br />
            <h2 className="text-4xl">Subscribe to mAI</h2>
            <br />
            <div className="flex items-center space-x-4">
              <h1 className="text-6xl font-bold">${calculateTotal()}</h1>
              <div>
                <p className="text-lg font-medium">Per month</p>
                <p className="text-gray-400 text-base">Cancel anytime</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-700" />

          <div className="space-y-6">

            <div className="flex items-center">
              <img src="/assets/icons/icon_tstar.png" alt="mAI icon" className="text-xl w-12 h-12" />
              <div className="w-px h-12 bg-gray-700 mx-4"></div>
              <div>
                <p className="text-lg font-medium">Powerful</p>
                <p className="text-gray-400">mAI features</p>
              </div>
            </div>

            <div className="flex items-center">
              <img src="/assets/icons/icon_check_white.png" alt="Tasks icon" className="text-xl w-12 h-12" />
              <div className="w-px h-12 bg-gray-700 mx-4"></div>
              <div>
                <p className="text-lg font-medium">{selectedTasks || '500'} tasks</p>
                <p className="text-gray-400">Per month</p>
              </div>
            </div>

            <div className="flex items-center">
              <img src="/assets/icons/icon_a.png" alt="Apps icon" className="text-xl w-12 h-12" />
              <div className="w-px h-12 bg-gray-700 mx-4"></div>
              <div>
                <p className="text-lg">App</p>
                <p className="text-gray-400">Actions</p>
              </div>
            </div>

          </div>

        </div>

        {/* Right side - Options */}
        <div className="flex flex-col h-full">
          <div className="flex-grow space-y-8">
            <div className="space-y-4">
              <p className="text-black font-medium">Need <span className="text-gray-600">More Tasks?</span></p>
              <div className="space-y-2">
                <button 
                  onClick={() => toggleTasks('1000')}
                  className={`w-full p-3 rounded-lg border ${selectedTasks === '1000' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
                >
                  <span>1000 Tasks</span>
                  <span>+$10</span>
                </button>
                <button 
                  onClick={() => toggleTasks('2000')}
                  className={`w-full p-3 rounded-lg border ${selectedTasks === '2000' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
                >
                  <span>2000 Tasks</span>
                  <span>+$30</span>
                </button>
                <button 
                  onClick={() => toggleTasks('3000')}
                  className={`w-full p-3 rounded-lg border ${selectedTasks === '3000' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
                >
                  <span>3000 Tasks</span>
                  <span>+$60</span>
                </button>
                <button 
                  onClick={() => toggleTasks('unlimited')}
                  className={`w-full p-3 rounded-lg border ${selectedTasks === 'unlimited' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
                >
                  <span>Unlimited</span>
                  <span>+$99</span>
                </button>
              </div>
            </div>
          </div>

          {/* New mobile sticky button container */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <button
              onClick={handleSubscribe}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : `Subscribe for $${calculateTotal()}/m`}
            </button>
          </div>

          {/* Desktop button remains in the grid */}
          <div className="hidden md:block">
            <button
              onClick={handleSubscribe}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : `Subscribe for $${calculateTotal()}/m`}
            </button>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        planData={planData}
      />
    </div>
  );
};

export default MAISubscribe; 