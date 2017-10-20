'use strict';

import * as paypal from "paypal-rest-sdk";
import {paypalConfig} from "../config/paypalConfig"

paypal.configure(paypalConfig);

export const paypalCharge = (data) => {
        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://return.url",
                "cancel_url": "http://cancel.url"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": data.name,
                        "price": data.price,
                        "currency": data.currency,
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": data.currency,
                    "total": data.price
                },
                "description": 'Charge'
            }]
        };

    const promise = new Promise((resolve, reject) => {
        setTimeout(() => paypal.payment.create(create_payment_json,  (error, payment) => {
            if (error) {
                reject(new Error(error));
            } else {
                resolve(payment)
            }
        }), 5000);
    });

    promise
        .then(payment => payment)
        .catch(error => {throw error});
    return promise;
};

export const paypalExecutePayment = (req) => {
    let execute_payment_json = {
        "payer_id": req.payload.payerID
    };
    let paymentId = req.payload.paymentID;

    const promise = new Promise((resolve, reject) => {
       setTimeout(() => paypal.payment.execute(paymentId, execute_payment_json, (error, payment) =>{
           if (error) {
               reject(new Error(error));
               throw error;
           } else {
               resolve(payment);
           }
       }), 5000);
    });
    promise
        .then(payment => payment)
        .catch(error => {throw error});
    return promise;
};

export const paypalPaymentDetails = (id) => {
    return new Promise((resolve,reject) => {
        paypal.payment.get(id, (error, payment) => {
            if(error){
                reject(error);
            }else{
                resolve({
                    data: payment,
                    type: 'paypal'
                });
            }
        })
    })
};