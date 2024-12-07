const { plans } = require('../models');
const logger = require('../utils/logger');
const config = require('../utils/main');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.stripePayment = async (req, res) => {
    try {
        const { appsLimit, planType, tasksLimit, workSpaceLimit } = req.body;

        if (!config.PlanDetails[planType]) {
            return res.status(400).json({ message: "Invalid plan type" });
        }
        let price = 0;
        if (planType === "mixi") {
            const tasks = config.PlanDetails[planType].TasksPrice.find(task => task.limit === tasksLimit);
            console.log(tasks);
            const apps = config.PlanDetails[planType].AppsPrice.find(app => app.limit === appsLimit);
            const workspaces = config.PlanDetails[planType].WorkSpacePrice.find(workspace => workspace.limit === workSpaceLimit);
            if (!tasks || !apps || !workspaces) {
                return res.status(400).json({ message: "Invalid limit values" });
            }
            price = config.PlanDetails[planType].basicPrice + tasks.price + apps.price + workspaces.price;
        } else {
            const tasks = config.PlanDetails[planType].TasksPrice.find(task => task.limit === tasksLimit);
            if (!tasks) {
                return res.status(400).json({ message: "Invalid limit values" });
            }
            price = config.PlanDetails[planType].basicPrice + tasks.price;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(price * 100),
            currency: 'usd',
        });

        const userId = req.user.id;
        const newPlan = await plans.create({ workSpaceLimit: workSpaceLimit === "unlimited" ? 100 : workSpaceLimit, appsLimit: appsLimit === "unlimited" ? 18 : appsLimit, tasksLimit: tasksLimit === "unlimited" ? 99999 : tasksLimit, user_id: userId, status: "inactive", paymentIntentId: paymentIntent.id, planType: planType, amount: price });

        res.json({ clientSecret: paymentIntent.client_secret, price });
    } catch (error) {
        logger.error('stripePayment error : ', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.stripeVerifyPayment = async (req, res) => {
    const { paymentIntentId } = req.body;
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
            const userId = req.user.id;

            const paidAmount = paymentIntent.amount / 100;
            await plans.update({ status: "inactive" }, { where: { user_id: userId } });
            const plan = await plans.findOne({ where: { paymentIntentId } });
            await plan.update({ status: "active" });
            return res.status(200).json({ message: "Payment successful", paidAmount });
        }
        return res.status(400).json({ message: "Payment failed" });
    } catch (error) {
        logger.error('stripeVerifyPayment error : ', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
