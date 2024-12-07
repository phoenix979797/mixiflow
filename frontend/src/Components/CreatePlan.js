import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backendAxios from '../utils/backendAxios';

const CreatePlan = () => {
    const navigate = useNavigate();
    const [hasExistingPlan, setHasExistingPlan] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Check if user has existing plan
        backendAxios.get('/plans').then(res => {
            setHasExistingPlan(res.data.length > 0);
        }).catch(err => {
            console.log(err);
        });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            {hasExistingPlan && (
                <div className="w-full max-w-4xl mb-4">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
                    >
                        <span className="mr-2">←</span> Back to Dashboard
                    </Link>
                </div>
            )}

            <div className="w-full max-w-4xl space-y-8 md:px-16">
                <div className="text-left space-y-1">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        We've got a plan
                    </h1>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        that's perfect for you.
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-0 mt-8">
                    <div className="border-2 border-gray-400 p-1 space-y-4 relative hover:shadow-lg transition-shadow hover:bg-gray-100 hover:border-black hover:border-[3px]">
                        <div className="absolute top-0 right-0 bg-black text-white px-2 py-1 text-xs md:text-sm">
                            Popular Choice
                        </div>
                        <div className="px-6">
                            <div className="space-y-1 text-left mt-10">
                                <h2 className="text-2xl sm:text-2xl font-semibold">Mixiflow</h2>
                                <div className="text-4xl sm:text-4xl font-bold">$29/m</div>
                            </div>
                            <Link to="/mixi-subscribe">
                                <button className="mt-8 w-full bg-black text-white py-2 rounded-full hover:bg-gray-700 transition-colors">
                                    Choose
                                </button>
                            </Link>
                            <hr className="border-gray-300 mt-8" />
                            <div className="text-left">
                                <div className="inline-flex justify-center items-center border border-gray-700 px-3 py-1 rounded-full mt-8">
                                    <img src="/assets/icons/icon_tstar_black.png" alt="mAI icon" className="w-5 h-5" />
                                    <span className="text-xs sm:text-sm">mAI Included</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-4 pb-2">
                            <h4 className="font-medium text-sm sm:text-base text-left px-2">Features:</h4>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Everything in mAI and More</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Full integration with all apps</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Multi-step actionable widgets</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Social media management</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Task management tools</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Automation & Insights</span>
                            </div>
                            
                        </div>
                    </div>

                    <div className="border-2 border-gray-400 p-1 space-y-4 relative hover:shadow-lg transition-shadow hover:bg-gray-100 hover:border-black hover:border-[3px]">
                        <div className="px-6">
                            <div className="space-y-1 text-left mt-10">
                                <h2 className="text-2xl sm:text-2xl font-semibold">mAI</h2>
                                <div className="text-4xl sm:text-4xl font-bold">$19/m</div>
                            </div>
                            <Link to="/mai-subscribe">
                                <button className="mt-8 w-full bg-black text-white py-2 rounded-full hover:bg-gray-700 transition-colors">
                                    Choose
                                </button>
                            </Link>
                            <hr className="border-gray-300 mt-8" />
                            <div className="text-left">
                                <div className="inline-flex border border-gray-700 px-3 py-1 rounded-full mt-8">
                                    <span className="text-xs sm:text-sm">Standalone Product</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-4 pb-2">
                            <h4 className="font-medium text-sm sm:text-base text-left px-2">Features:</h4>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Generate Content: Summaries, emails, docs</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Edit Live in-card powerful editing tools</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>App Actions (notion, spreadsheet)</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Smart Suggestions (Content suggestions)</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>All-in-One Workflow: Back in one place</span>
                            </div>
                            <div className="flex items-center text-left">
                                <img src="/assets/icons/icon_check_black.png" alt="check" className="w-8 h-8" />
                                <span>Export PDF and other sharing tools</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePlan; 