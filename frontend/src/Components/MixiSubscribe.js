import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';
import backendAxios from '../utils/backendAxios';
import { useToast } from '../context/ToastContext';

const MixiSubscription = () => {
  const [selectedTasks, setSelectedTasks] = useState(null);
  const [selectedApps, setSelectedApps] = useState(null);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [planData, setPlanData] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const toggleTasks = (value) => {
    setSelectedTasks(selectedTasks === value ? null : value);
  };

  const toggleApps = (value) => {
    setSelectedApps(selectedApps === value ? null : value);
  };

  const toggleWorkspaces = (value) => {
    setSelectedWorkspaces(selectedWorkspaces === value ? null : value);
  };

  const calculateTotal = () => {
    const basePrice = 29;
    const tasksPricing = {
      '2000': 30,
      '3000': 50,
      'unlimited': 99
    };
    const appsPricing = {
      '5': 20,
      '10': 40,
      'unlimited': 99
    };
    const workspacesPricing = {
      '5': 20,
      '10': 40,
      '20': 60,
      'unlimited': 99
    };

    return basePrice +
      (selectedTasks ? tasksPricing[selectedTasks] : 0) +
      (selectedApps ? appsPricing[selectedApps] : 0) +
      (selectedWorkspaces ? workspacesPricing[selectedWorkspaces] : 0);
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Create payment intent on your backend
      const response = await backendAxios.post('/payment/stripe', {
        workSpaceLimit: selectedWorkspaces || '2',
        appsLimit: selectedApps || '2',
        tasksLimit: selectedTasks || '500',
        planType: 'mixi',
      });
      const { clientSecret, price } = response.data;

      setPlanData({
        workSpaceLimit: selectedWorkspaces || '2',
        appsLimit: selectedApps || '2',
        tasksLimit: selectedTasks || '500',
        planType: 'mixi',
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <div className="w-full max-w-6xl mb-4">
        <Link
          to="/create-plan"
          className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <span className="mr-2">←</span> Back to Create Plan
        </Link>
      </div>
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 mb-[72px] md:mb-0">
        <div className="md:hidden bg-black text-white p-6 rounded-lg space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl text-left">Subscribe to Mixiflow</h2>
            <div className="flex items-center space-x-6 justify-start">
              <h1 className="text-6xl font-bold">$29</h1>
              <div>
                <p className="text-ms text-left">Per month</p>
                <p className="text-ms text-left">Cancel anytime</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center">
              <img src="/assets/icons/icon_tstar.png" alt="mAI icon" className="text-xl w-12 h-12" />
              <div>
                <p className="text-[11px]">mAI</p>
                <p className="text-[11px]">Included</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <img src="/assets/icons/icon_check_white.png" alt="Tasks icon" className="text-xl w-12 h-12" />
              <div>
                <p className="text-[11px]">2000 tasks</p>
                <p className="text-[11px]">Per month</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <img src="/assets/icons/icon_a.png" alt="Apps icon" className="text-xl w-12 h-12" />
              <div>
                <p className="text-[11px]">2 apps per</p>
                <p className="text-[11px]">Workspace</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <img src="/assets/icons/icon_list.png" alt="Workspaces icon" className="text-xl w-12 h-12" />
              <div>
                <p className="text-[11px]">Create up to</p>
                <p className="text-[11px]">2 Workspaces</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-black text-white p-8 rounded-lg space-y-8 hidden md:block">
          <div className="space-y-2">
            <br />
            <h2 className="text-4xl">Subscribe to Mixiflow</h2>
            <br />
            <div className="flex items-center space-x-4">
              <h1 className="text-5xl font-bold">${calculateTotal()}</h1>
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
                <p className="text-lg font-medium">mAI</p>
                <p className="text-gray-400">Included</p>
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
                <p className="text-lg font-medium">{selectedApps || '2'} apps per</p>
                <p className="text-gray-400">Workspace</p>
              </div>
            </div>

            <div className="flex items-center">
              <img src="/assets/icons/icon_list.png" alt="Workspaces icon" className="text-xl w-12 h-12" />
              <div className="w-px h-12 bg-gray-700 mx-4"></div>
              <div>
                <p className="text-lg font-medium">Create up to</p>
                <p className="text-gray-400">{selectedWorkspaces || '2'} Workspaces</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Options */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-black font-medium">Want <span className="text-gray-600">More Tasks?</span></p>
            <div className="space-y-2">
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
                <span>+$50</span>
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

          <div className="space-y-4">
            <p className="text-black font-medium">Want <span className="text-gray-600">More Apps?</span></p>
            <div className="space-y-2">
              <button
                onClick={() => toggleApps('5')}
                className={`w-full p-3 rounded-lg border ${selectedApps === '5' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
              >
                <span>5 apps per workspace</span>
                <span>+$20</span>
              </button>
              <button
                onClick={() => toggleApps('10')}
                className={`w-full p-3 rounded-lg border ${selectedApps === '10' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
              >
                <span>10 apps per workspace</span>
                <span>+$40</span>
              </button>
              <button
                onClick={() => toggleApps('unlimited')}
                className={`w-full p-3 rounded-lg border ${selectedApps === 'unlimited' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
              >
                <span>Unlimited apps per workspace</span>
                <span>+$99</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-black font-medium">Looking for <span className="text-gray-600">More Workspaces?</span></p>
            <div className="space-y-2">
              <button
                onClick={() => toggleWorkspaces('5')}
                className={`w-full p-3 rounded-lg border ${selectedWorkspaces === '5' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
              >
                <span>5 workspaces</span>
                <span>+$20</span>
              </button>
              <button
                onClick={() => toggleWorkspaces('10')}
                className={`w-full p-3 rounded-lg border ${selectedWorkspaces === '10' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
              >
                <span>10 workspaces</span>
                <span>+$40</span>
              </button>
              <button
                onClick={() => toggleWorkspaces('20')}
                className={`w-full p-3 rounded-lg border ${selectedWorkspaces === '20' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
              >
                <span>20 workspaces</span>
                <span>+$60</span>
              </button>
              <button
                onClick={() => toggleWorkspaces('unlimited')}
                className={`w-full p-3 rounded-lg border ${selectedWorkspaces === 'unlimited' ? 'border-black' : 'border-gray-300'} flex justify-between items-center`}
              >
                <span>Unlimited</span>
                <span>+$99</span>
              </button>
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

export default MixiSubscription; 