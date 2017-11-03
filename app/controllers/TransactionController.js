'use strict'

import Boom from 'boom';
import {createMembership, updateMembershipEndDate} from "./MembershipController";
import Models from '../models';
import moment from 'moment';
import { stripeCharge, stripePaymentDetails } from "../util/stripeFunctions";
import { paypalCharge, paypalExecutePayment, paypalPaymentDetails } from "../util/paypalFunctions";
import _ from "lodash";

const Transaction = Models.transaction;
const Membership = Models.membership;
const Plan = Models.plan;
const User = Models.user;
const Sequelize = Models.Sequelize;
const Op = Sequelize.Op;

/* Stripe Transactions */

export const paymentStripe = async (req, res ) => {
    let data = Object.assign({}, req.pre.plan.data.dataValues);
    try{
        let charge = await stripeCharge(req, data);
        let membership = await createMembership(req);
        let transaction = await createTransactionStripe(charge, membership);
        res({data: membership}).code(201);
    } catch(e) {
        res(Boom.badRequest(e));
    }
};

export const paymentMembershipStripe = async (req, res) => {
    let data = Object.assign({}, req.pre.membership.data.dataValues.plan.dataValues);
    try{
        let charge = await stripeCharge(req, data);
        let transaction = await createTransactionStripe(charge, req.pre.membership.data.dataValues);
        await updateMembershipEndDate(req.pre.membership.data.dataValues);    
        res({data: transaction}).code(201)
    } catch(e) {
        res(Boom.badRequest(e));
    }
};

let createTransactionStripe = async (charge, membership) => {
    try {
   return await Transaction
        .create({
            paid_date: moment.unix(charge.created).utc(),
            total: charge.amount/100,
            currency: charge.currency.toUpperCase(),
            status: charge.status,
            transaction_id: charge.id,
            description: charge.description,
            payment_method: "stripe",
            membership_id: membership.id
        });
    } catch(e) {
       throw new Error(e)
    }
};

/* PayPal Transactions */

export const paymentPaypal = async (req, res) => {
    try {
        let data = Object.assign({}, req.pre.plan.data.dataValues);
        let payment = await paypalCharge(data);
        res(payment);
    } catch (error) {
        res(Boom.badRequest(error))
    }
};

export const paymentExecutePaypal = async (req, res) => {
    try {
        let payment = null;
        if(!req.payload.payment) {
            payment = await paypalExecutePayment(req);
        }else{
            payment = req.payload.payment;
        }
        if (payment.transactions[0].related_resources[0].sale.state === "completed") {
            let membership = await createMembership(req);
            let transaction = await createTransactionPaypal(payment, membership);
            res({data: membership}).code(201);
        }
    } catch (error) {
        res(Boom.badRequest(error));
    }
};

let createTransactionPaypal = async (charge, membership) => {
    try {
        return await Transaction
            .create({
                paid_date: charge.create_time,
                total: charge.transactions[0].amount.total,
                currency: charge.transactions[0].amount.currency,
                status: charge.state,
                transaction_id: charge.id,
                description: charge.transactions[0].description,
                payment_method: "paypal",
                membership_id: membership.id
            });
    }
    catch(e) {
       throw new Error(e)
    }
};

export const paymentMembershipPaypal = async (req, res) => {
    try {
        let data = Object.assign({}, req.pre.membership.data.dataValues.plan.dataValues);
        let payment = await paypalCharge(data);
        res(payment).code(201);
    } catch (error) {
        res(Boom.badRequest(error))
    }
};

export const paymentExecuteMembershipPaypal = async (req, res) => {
    try {
        let payment = await paypalExecutePayment(req);
        if (payment.transactions[0].related_resources[0].sale.state === "completed") {
            await updateMembershipEndDate(req.pre.membership.data.dataValues);
            let transaction = await createTransactionPaypal(payment, req.pre.membership.data.dataValues);
            res({data: transaction}).code(201);
        }
    } catch (error) {
        res(Boom.badRequest(error));
    }
};

const searchBalances = (req, res) => {

}

export const findUserBalance = (req, res) => {
    let q = _.omit(req.query, ['start', 'end', 'size', 'page']);
    let size = parseInt(req.query.size) || 15,
        page= parseInt(req.query.page) || 1,
        offset = size * (page - 1);
    return Transaction
        .findAndCountAll({
            offset: offset,
            limit: size,
            order: [['created_at', 'DESC']],
            where: (req.query.start && req.query.end)?
                {...q, created_at: { [Op.between]: [`${req.query.start} 00:00:00`, `${req.query.end} 23:59:59`]}} : q,
            include: [{
                model : Membership,
                where: {user_id: req.auth.credentials.id },
                include: {model:Plan, attributes: ['id', 'name']},
                attributes: ['id'] }],
            attributes: ['id', 'paid_date', 'total', 'currency', 'payment_method', 'transaction_id']
        })
        .then(transactions => {
            let pages = Math.ceil(transactions.count / size);
            res({
                data: transactions.rows,
                meta: {
                    total: transactions.count,
                    pages: pages,
                    items: size,
                    page: page
                }
            }).code(200)
        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const findAllBalances = (req, res) => {
    let q = _.omit(req.query, ['start', 'end', 'size', 'page']);
    let size = parseInt(req.query.size) || 15,
    page= parseInt(req.query.page) || 1,
    offset = size * (page - 1);
    return Transaction
        .findAndCountAll({
            offset: offset,
            limit: size,
            order: [['created_at', 'DESC']],
            where: (req.query.start && req.query.end) ?
                Object.assign(
                    { created_at: {
                            [Op.between]: [`${req.query.start} 00:00:00`, `${req.query.end} 23:59:59`]
                        }
                    }, q) : q,
            include: [{
                model : Membership,
                paranoid: false,
                where:  (req.params.userId) ? {user_id :req.params.userId} :
                (req.params.planId) ? {plan_id:req.params.planId} :
                {},
                include: [
                    {model:Plan,
                        attributes: ['id', 'name']
                    },
                    {
                        model:User,
                        paranoid: false,
                        attributes: ['id', 'name']
                    }
                ],
                attributes: ['id'] }],
            attributes: ['id', 'paid_date', 'total', 'currency', 'payment_method','transaction_id']
        })
        .then(transactions => {
            let pages = Math.ceil(transactions.count / size);
            res({
                data: transactions.rows,
                meta: {
                    total: transactions.count,
                    pages: pages,
                    items: size,
                    page: page
                }
            }).code(200)
        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const getPaymentDetails = (req, res) => {
    const { id } = req.params;
    Transaction
        .findOne({
            where: { id }
        })
        .then(t =>  {
            if(t.payment_method === 'paypal') {
                return paypalPaymentDetails(t.transaction_id);
            }else if(t.payment_method === 'stripe'){
                return stripePaymentDetails(t.transaction_id);
            }
        })
        .then(data => res(data).code(200))
        .catch(err => Boom.badRequest(err));
};

export const verifyPaypalPayment = (req,res) => {
    const paymentId = req.params.id;
    paypalPaymentDetails(paymentId)
        .then(data => res(data).code(200))
        .catch(err => Boom.badRequest(err))
};