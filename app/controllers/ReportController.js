'use strict';

import Boom from 'boom';
import request from 'request';
import Models from '../models';
import { API_PROCESSOR } from "../constants";
import fs from 'fs';
import moment from 'moment';

const Report = Models.report;
const User = Models.user;
const Membership = Models.membership;
const Sequelize = Models.Sequelize;
const Op = Sequelize.Op;

export const findUserReports = (req, res) => {
    let size = parseInt(req.query.size) || 15,
        page= parseInt(req.query.page) || 1,
        offset = size * (page - 1);
    return Report
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
                } : {user_id: req.auth.credentials.id}
        })
        .then(reports => {
            let pages = Math.ceil(reports.count / size);
            res({
                data: reports.rows,
                meta: {
                    total: reports.count,
                    pages: pages,
                    items: size,
                    page: offset+1
                }
            }).code(200)
        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const findUserReport = (req, res) => {
    return Report
        .findOne({ where: { user_id: req.auth.credentials.id, id: req.params.id } })
        .then(report => res.file(report.dataValues.link))
        .catch((error) => res(Boom.badRequest(error)));
};

export const createReport = (req, file) => {
    return Report
        .create({
            user_id: req.auth.credentials.id,
            reference: req.params.reference,
            link: file
        })
        .then(report => report)
        .catch(error => {
            throw new Error(error)
        });
};

export const checkUserReports = async (req, res) => {
    try {
        let response = await Membership
            .sum('remaining_reports', {
                where: {
                    user_id: req.auth.credentials.id
                }
            });
        (response <= 0 || isNaN(response)) ? res(Boom.forbidden(`Can't generate report`)) : res(response)
    } catch (err) {
        res(Boom.badRequest(err))
    }
};

export const remainingReports = async (req) => {
    try {
        let response = await Membership
            .findOne({
                where: {
                    user_id: req.auth.credentials.id,
                    remaining_reports: { [Op.gt]: 0 }
                },
                order: [['end_date', 'ASC']]
            });
        return await response
            .update({ remaining_reports: response.dataValues.remaining_reports - 1 });
    }
    catch (err) {
        throw new Error(error);
    }
};

export const generateUserReport = (req, res) => {
    const now = moment(), date = now.clone();
    const reference = req.params.reference;
    const filename = `./public/report_${date}_${reference}_user_${req.auth.credentials.id}.pdf`;

    request.post(
        {
            url: `${API_PROCESSOR}/property/process/${reference}/pdf`,
            json: true,
            body: {
                graphicBase64: req.payload.graphic
            }
        })
        .on('error', (err) => {
            res(Boom.badImplementation(err));
        })
        .pipe(fs.createWriteStream(filename))
        .on('finish', () => {
            Promise.all([createReport(req, filename), remainingReports(req)])
                .then(values => res.file(filename))
                .catch(error => res(Boom.badRequest(error)))
        })
};