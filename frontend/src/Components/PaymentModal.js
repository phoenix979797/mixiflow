import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Modal from './Modal';
import backendAxios from '../utils/backendAxios';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ planData, onClose }) => {
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!stripe || !elements) {
            return;
        }

        try {
            // Confirm the payment with Stripe
            const result = await stripe.confirmCardPayment(planData.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                // Payment successful
                await backendAxios.post('/payment/stripe/verify', { paymentIntentId: result.paymentIntent.id });
                showToast("Payment successful", "success");
                navigate('/dashboard');
                onClose();
                // You might want to update the UI or redirect to a success page
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                    className="p-3 border border-gray-300 rounded-lg"
                />
            </div>

            {error && (
                <div className="text-red-500 mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : `Pay $${planData?.price}`}
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

const PaymentModal = ({ isOpen, onClose, planData }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Your Subscription">
            <div className="space-y-6">
                <div className="text-center">
                    <p className="text-gray-600">Total: ${planData?.price}/month</p>
                </div>

                <Elements stripe={stripePromise}>
                    <CheckoutForm planData={planData} onClose={onClose} />
                </Elements>
            </div>
        </Modal>
    );
};

export default PaymentModal; 