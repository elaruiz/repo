'use strict';

import Boom from 'boom';
import Models from '../models';
import { API_PROCESSOR, API_CATASTRO } from "../constants"
import request from 'request-promise';

const Search = Models.search;
const Sequelize = Models.Sequelize;

export const findUserSearches = (req, res) => {
    let size = parseInt(req.query.size) || 5,
        page = parseInt(req.query.page) || 1,
        offset = size * (page - 1);
    return Search
        .findAndCountAll({
            where: {
                user_id: (req.params.userId) ? req.params.userId : req.auth.credentials.id
            },
            offset: offset,
            limit: size,
            order: [['updated_at', 'DESC']]
        })
        .then(searches => {
            let pages = Math.ceil(searches.count / size);
            res({
                data: searches.rows,
                meta: {
                    total: searches.count,
                    pages: pages,
                    items: size,
                    page: page
                }
            })
                .code(200)
        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const findUsersSearches = (req, res) => {
    let size = parseInt(req.query.size) || 5,
        page = parseInt(req.query.page) || 1,
        offset = size * (page - 1);
    return Search
        .findAndCountAll({
            offset: offset,
            limit: size,
            order: [['updated_at', 'DESC']]
        })
        .then(searches => {
            let pages = Math.ceil(searches.count / size);
            res({
                data: searches.rows,
                meta: {
                    total: searches.count,
                    pages: pages,
                    items: size,
                    page: page
                }
            })
                .code(200)
        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const findMostWanted = async (req, res) => {
    return Search
        .findAll({
            group: ['reference', 'url', 'address'],
            attributes: ['reference', Sequelize.fn('count', Sequelize.col('reference')), 'url', 'address'],
            order: [['count', 'DESC']],
            limit: parseInt(req.query.size) || 10
        })
        .then(search => {
            res({data: search}).code(200)
        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const createSearch = async (property, req) => {
    try {
        let [instance, wasCreated] = await Search.findCreateFind({
            where: {
                address: property.address,
                reference: property.reference,
                url: `${req.params.provincia}/${req.params.municipio}/${req.params.referencia}`,
                user_id: req.auth.credentials.id
            }
        });
        if (wasCreated === false) {
            let search = await Search.findOne({
                where: {
                    address: property.address,
                    reference: property.reference,
                    url: `${req.params.provincia}/${req.params.municipio}/${req.params.referencia}`,
                    user_id: req.auth.credentials.id
                }
            });
            search.changed('updated_at', true);
            return await search.save()
        }
        return instance;

    }
    catch (error) {
        throw new Error(error)
    }

};

export const deleteSearches = (req, res) => {
    return Search
        .destroy({
            where: {user_id: req.params.userId}
        })
        .then(success => res().code(204))
        .catch(error => res(Boom.badRequest(error)));
};

export const searchProperty = (req, res) => {
    const {params} = req;
    const {provincia, municipio, referencia} = params;

    request({
        uri: `${API_PROCESSOR}/property/process/${provincia}/${municipio}/${referencia}`,
        json: true
    })
        .then(response => {
            if (req.auth.credentials) {
                createSearch(response.data, req)
                    .then(success => success)
                    .catch(e => {
                        throw new Error(e)
                    });
            }
            res(response).code(200);
        })
        .catch(e => res(Boom.badRequest(e)))
};

export const searchByAddress = (req, res) => {
    const {query} = req;
    const {province, municipality, street, type, number} = query;
    const page = query.page || 1;

    const cleanProv = province.replace(/Ñ/g, '~');
    const cleanMun = municipality.replace(/Ñ/g, '~');
    const cleanStreet = street.replace(/Ñ/g, '~');

    const url = `${API_CATASTRO}/property/address?province=${cleanProv}&municipality=${cleanMun}&type=${type}&street=${cleanStreet}&number=${number}&page=${page}`;
    request({
        uri: url,
        json: true
    })
        .then(response => {
            res(response).code(200);
        })
        .catch(e => res(Boom.badRequest(e)))
};

export const searchMunicipalities = (req, res) => {
    const cleanName = req.params.name.replace(/Ñ/g, '~');
    let url = `${API_CATASTRO}/municipalities/${cleanName}`;
    request({
        uri: url,
        json: true
    })
        .then(response => {
            res(response).code(200);
        })
        .catch(e => res(Boom.badRequest(e)))
};

export const searchProvinces = (req, res) => {
    let url = `${API_CATASTRO}/provinces`
    request({
        uri: url,
        json: true
    })
        .then(response => {
            res(response).code(200);
        })
        .catch(e => res(Boom.badRequest(e)))
};

export const searchVias = (req, res) => {
    const cleanMun = req.params.municipality.replace(/Ñ/g, '~');
    const cleanProv = req.params.province.replace(/Ñ/g, '~');
    let url = `${API_CATASTRO}/vias/${cleanProv}/${cleanMun}`;
    request({
        uri: url,
        json: true
    })
        .then(response => {
            res(response).code(200);
        })
        .catch(e => res(Boom.badRequest(e)))
};

export const searchFullAddresses = (req, res) => {
    const q = req.query.q.replace(/[Ññ]/g,'~');
    request({
        uri: `${API_CATASTRO}/addresses?q=${q}`,
        json: true
    }).then(response => res(response).code(200))
      .catch(e => res(Boom.badRequest(e)))
};