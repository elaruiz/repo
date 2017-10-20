'use strict';

import Boom from 'boom';
// const Plan = require('../models').plan;
import Models from '../models';
const Plan = Models.plan;

export const findPlan = (req, res) => {
    let id = req.params.id;
    return Plan
        .findById(id)
        .then(plan => {
            if (!plan) {
                return res(Boom.notFound('Not Found'));
            }
            return res({data: plan}).code(200);
        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const findAllPlans = (req, res) => {
    let size = parseInt(req.query.size) || 15,
    page= parseInt(req.query.page) || 1,
    offset = size * (page - 1);
    return Plan
        .findAndCountAll({offset: offset, limit: size})
        .then(plans => { 
            let pages = Math.ceil(plans.count / size);
            res({
                data: plans.rows, 
                meta: {
                    total: plans.count, 
                    pages: pages,
                    items: size,
                    page: offset+1      
                }
            })
            .code(200)
        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const createPlan = (req, res) => {
    Plan
        .create(req.payload)
        .then(plan => res({data: plan}).code(201))
        .catch(error => Boom.badRequest(error));

};

export const updatePlan = (req, res) => {
    return Plan
        .update(req.payload, {where: {id: req.params.id}, returning:true})
        .then(plan => res({data: plan[1][0]}).code(200))
        .catch(error => res(Boom.badRequest(error)))
};

export const deletePlan = (req, res) => {
    return Plan
        .destroy({
            where: {id: req.params.id}
        })
        .then(success => res().code(204))
        .catch(error => res(Boom.badRequest(error)));
};
