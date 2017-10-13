'use strict';

import Boom from 'boom';
import Models from '../models';
import { API_PROCESSOR, API_CATASTRO } from "../constants"
import request from 'request-promise';
const Search = Models.search;
const User = Models.user;
const Sequelize = Models.Sequelize;

export const findUserSearches = (req, res) => {
    let size = parseInt(req.query.size) || 15,
    page= parseInt(req.query.page) || 1,
    offset = size * (page - 1);
    return Search
        .findAndCountAll({ where: { user_id: req.auth.credentials.id }, offset: offset, limit: size })
        .then(searches => { 
            let pages = Math.ceil(searches.count / size);
            res({
                data: searches.rows, 
                meta: {
                    total: searches.count, 
                    pages: pages,
                    items: size,
                    page: offset+1      
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
            offset: req.query.page, 
            limit: req.query.size || 10
        })
        .then(search => { res({data: search}).code(200) })
        .catch((error) => res(Boom.badRequest(error)));
};

export const createSearch = async (property, id) => {
    try {
    return await Search.create({
        address: property.address, 
        reference: property.reference, 
        user_id: id});
    } catch (error) {
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
    request({
        uri: `${API_PROCESSOR}/api/property/process/${req.params.referencia}`,
        json: true
    })
    .then(response => {
        if (req.auth.credentials) {
            createSearch(response.data, req.auth.credentials.id)
            .then(success => success)
            .catch(e => {throw new Error(e)});
            }
        res(response).code(200);
        })
        .catch(e => res(Boom.badRequest(e)))
}

export const searchByAddress = (req, res) => {
    request({
        uri: url,
        json: true
    })
    .then(response => {
        res(response).code(200);
    })
    .catch(e => res(Boom.badRequest(e)))
}

export const searchMunicipalities = (req, res) => {
    let url = `${API_CATASTRO}/municipalities/${req.params.name}`
    request({
        uri: url,
        json: true
    })
    .then(response => {
        res(response).code(200);
    })
    .catch(e => res(Boom.badRequest(e)))
}

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
}

export const searchVias = (req, res) => {
    let url = `${API_CATASTRO}/vias/${req.params.province}/${req.params.municipality}`
    request({
        uri: url,
        json: true
    })
    .then(response => {
        res(response).code(200);
    })
    .catch(e => res(Boom.badRequest(e)))
}
