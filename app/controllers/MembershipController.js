'use strict'

import Boom from 'boom';
import Models from '../models';
import moment from 'moment';
const Membership = Models.membership;
const Plan = Models.plan;

export const createMembership = async (req) => {
    try {
    return await Membership.
        create({user_id: req.auth.credentials.id, plan_id: req.params.id, remaining_reports: req.pre.plan.data.dataValues.reports}, req.pre.plan)
    } catch(e) {
        throw new Error(e);
    }
};

export const findUserMemberships = (req, res) => {
    let size = parseInt(req.query.size) || 15,
        page= parseInt(req.query.page) || 1,
        offset = size * (page - 1);
    return Membership
        .findAndCountAll({
            offset: offset,
            limit: size,
            order: [['created_at', 'DESC']],
            where: (req.query.start && req.query.end) ?
                {
                    created_at: {
                        [Op.between]: [`${req.query.start} 00:00:00`, `${req.query.end} 23:59:59`]
                    },
                    user_id: req.auth.credentials.id
                } : {user_id: req.auth.credentials.id},
            attributes: {
                exclude: ['user_id', 'plan_id']},
            include: [{ model : Plan, attributes: {
                exclude: ['created_at', 'updated_at', 'deleted_at']} } ]
        })
        .then(memberships => {
            let pages = Math.ceil(memberships.count / size);
            res({
                data: memberships.rows,
                meta: {
                    total: memberships.count,
                    pages: pages,
                    items: size,
                    page: page
                }
            }).code(200)
        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const findUserMembership = (req, res) => {

    return Membership
        .findOne({
            where: {user_id: req.auth.credentials.id, id: req.params.membership},
            attributes: {
                exclude: ['user_id', 'plan_id']},
            include: [{ model : Plan, attributes: {
                exclude: ['created_at', 'updated_at', 'deleted_at']} } ]
        })
        .then(membership => {
            if (!membership) {
                return res(Boom.notFound('Not Found'));
            }
            return res({data: membership}).code(200);
        })
        .catch((error) => res(Boom.badRequest(error)));
};
    
export const deleteMembership = (req, res) => {
    return Membership
        .destroy({
            where: {id: req.params.id}
        })
        .then(users => res().code(204))
        .catch(error => res(Boom.badRequest(error)));
};

export const updateMembershipEndDate = async (membership) => {
    try {
    
    const old_end = moment(membership.end_date);
    let new_end = old_end.add(membership.plan.dataValues.interval_count, membership.plan.dataValues.interval_time);
    let m = await Membership.findById(membership.id);
    return await m.update({end_date: new_end, remaining_reports: membership.plan.dataValues.reports});
    } catch (error) {
        throw new Error(error);
    }
};
