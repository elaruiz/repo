import {
    findAllBalances,
    findUserBalance,
    getPaymentDetails,
    paymentExecuteMembershipPaypal,
    paymentExecutePaypal,
    paymentMembershipPaypal,
    paymentMembershipStripe
} from "../controllers/TransactionController";
import { findUserMembership } from "../controllers/MembershipController";
import { findPlan } from "../controllers/PlanController";

const payMembershipPaypalRoute ={
    method: 'POST',
    path: '/api/membership/{membership}/payment-paypal',
    config: {
        pre: [{ method: findUserMembership, assign: 'membership' }],
        auth: {
            strategy: 'jwt'
        },
        handler: paymentMembershipPaypal
    }
};

const payExecuteMembershipPaypalRoute = {
    method: 'POST',
    path: '/api/membership/{membership}/paypal-execute-payment',
    config: {
        pre: [{ method: findUserMembership, assign: 'membership' }],
        auth: {
            strategy: 'jwt'
        },
        handler: paymentExecuteMembershipPaypal
    }
};

const paymentStripeRoute = {
    method: 'POST',
    path: '/api/membership/{membership}/payment-stripe',
    config: {
        pre: [{ method: findUserMembership, assign: 'membership' }],
        auth: {
            strategy: 'jwt'
        },
        handler: paymentMembershipStripe
    }
};

const paypalRoute ={
    method: 'POST',
    path: '/api/plan/{id}/paypal-payment',
    config: {
        pre: [{ method: findPlan, assign: 'plan' }],
        auth: {
            strategy: 'jwt'
        },
        handler: paymentExecutePaypal
    }
};

const invoicesRoute = {
    method: 'GET',
    path: '/api/invoices',
    config: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: findAllBalances
    }
};

const invoiceByUserRoute = {
    method: 'GET',
    path: '/api/user/{userId}/invoices',
    config: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: findAllBalances
    }
};

const invoiceByPlanRoute = {
    method: 'GET',
    path: '/api/plan/{planId}/invoices',
    config: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: findAllBalances
    }
};

const invoicesUserRoute = {
    method: 'GET',
    path: '/api/invoices/my-invoices',
    config: {
        auth: {
            strategy: 'jwt'
        },
        handler: findUserBalance
    }
};

const paymentDetailsRoute = {
    method: 'GET',
    path: '/api/invoice/{id}/info',
    config: {
        auth: {
            strategy: 'jwt'
        },
        handler: getPaymentDetails
    }
};

export default [
    payMembershipPaypalRoute,
    payExecuteMembershipPaypalRoute,
    paymentStripeRoute,
    invoicesRoute,
    invoicesUserRoute,
    paypalRoute,
    invoiceByUserRoute,
    invoiceByPlanRoute,
    paymentDetailsRoute
];
