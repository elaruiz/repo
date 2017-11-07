'use strict';

import Boom from 'boom';
import { comparePasswords, hashPassword, sendMail, sendMailReminder} from "../util/userFunctions";
import {createToken} from '../util/token';
import moment from 'moment';
import Models from '../models/';
const User = Models.user;
const Membership = Models.membership;
import _ from 'lodash';
const Sequelize = Models.Sequelize;
const Op = Sequelize.Op;

export const verifyUniqueUser = (req, res) => {
    return User
        .findOne({
            where: {
                email: req.payload.email.toLowerCase()
            }
        })
        .then(user => {
            if (user) {
                return res(Boom.badRequest('Este email ya se encuentra registrado'));
            }
            res(req.payload);
        });
};

export const verifyCredentials = (req, res) => {
    const password = req.payload.password;
    return User
        .findOne({
            where: {
                email: req.payload.email.toLowerCase(),
            },
        })
        .then(user => {
            if (!user) {
                return res(Boom.badRequest('Email incorrecto'));
            }
            comparePasswords(password, user.password, (err, suc) => {
                if (err) {
                    throw new Error(err);
                }
                (suc) ? res(user) : res(Boom.badRequest('Contraseña incorrecta'))
            })
        })
        .catch(err => res(Boom.badRequest(err)));
};

export const verifyUser = (req, res) => {
    return req.params.id !== req.auth.credentials.id ? res(Boom.notFound('Not Found')) :
        User
            .findOne({
                where: {
                    id: req.params.id
                }
            })
            .then(user => {
                if (!user) {
                    return res(Boom.notFound('Not Found'));
                }
                return res(user);

            }).catch(err => res(Boom.badRequest(err)));
};

export const createUser = (req, res) => {
    hashPassword(req.payload.password, (err, hash) => {
        if (err) {
            throw Boom.badRequest(err);
        }
        User.create({
            name: req.payload.name,
            email: req.payload.email.toLowerCase(),
            password: hash,
        })
            .then(user => res({user : { token: createToken(user), data: _.omit(user.dataValues, ['password']) }}).code(201))
            .catch(err => Boom.badRequest(err));
    });
};

export const findUser = (req, res) => {
    return User
        .findOne({
            where: {id :req.auth.credentials.id},
        })
        .then(user => {
            if (!user) {
                return res(Boom.notFound('Not Found'));
            }
            return res(user);

        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const retrieveUser = (req, res) => {
    return User
        .findOne({
            where: {id :req.auth.credentials.id},
            attributes: {
                exclude: ['password']
            },
        })
        .then(user => {
            if (!user) {
                return res(Boom.notFound('Not Found'));
            }
            return res(user);

        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const findUserById = (req, res) => {
    return User
        .findOne({
            where: {id :req.params.id}
        })
        .then(user => {
            if (!user) {
                return res(Boom.notFound('Not Found'));
            }
            return res(user).code(200);

        })
        .catch((error) => res(Boom.badRequest(error)));
};

export const findAllUsers = (req, res) => {
    let size = parseInt(req.query.size) || 15,
        page= parseInt(req.query.page) || 1,
        offset = size * (page - 1);
    return User
        .findAndCountAll({
            offset: offset,
            limit: size,
            attributes: {
                exclude: ['password']
            }
        })
        .then(users => {
            let pages = Math.ceil(users.count / size);
            res({
                data: users.rows,
                meta: {
                    total: users.count,
                    pages: pages,
                    items: size,
                    page: page
                }}).code(200)})
        .catch((error) => res(Boom.badRequest(error)));
};

export const updateUser = (req, res) => {
    let user = req.pre.user;
    let newPassword = null;
    if (req.payload.password) {
        hashPassword(req.payload.password, (err, hash) => {
            if (err) {
                throw new Error(err);
            }
            user.update(Object.assign({}, _.omit(req.payload, ['password']), {password: hash}))
                .then((user) => {
                    res({ data: _.omit(user.dataValues, ['password'])}).code(200) })
                .catch((error) => res(Boom.badRequest(error)))
        })
    }
    else {
        user.update(req.payload, { silent: true })
            .then((user) => {
                res({ data: _.omit(user.dataValues, ['password'])}).code(200) })
            .catch((error) => res(Boom.badRequest(error)))
    }

};

export const updateUserPassword = (req, res) => {
    const password = req.payload.password;
    let user = req.pre.user;

    comparePasswords(password, user.dataValues.password, (err, suc) => {
        if (err) {
            throw new Error(err);
        }
        (!suc) ? res(Boom.badRequest('Contraseña incorrecta')) :
            hashPassword(req.payload.password2, (err, hash) => {
                if (err) {
                    throw new Error(err);
                }
                user.update( {password: hash})
                    .then((user) => {
                        res({ data: _.omit(user.dataValues, ['password'])}).code(200) })
                    .catch((error) => res(Boom.badRequest(error)))
            })
    });
};

export const updateUserInfo = (req, res) => {
    let user = req.pre.user;
    user.update(req.payload, { silent: true })
        .then((user) => {
            res({ data: _.omit(user.dataValues, ['password'])}).code(200) })
        .catch((error) => res(Boom.badRequest(error)))
};

export const deleteUser = (req, res) => {
    let user = req.pre.user;
    Membership.destroy({where: {user_id: user.id}});
    return user.destroy()
        .then(success => res().code(204))
        .catch(error => res(Boom.badRequest(error)))
};

export const resetPassword = async (req, res) => {
    try {
        let user = await User.findOne({ where: {id: req.pre.token.id}});
        hashPassword(req.payload.password, (err, hash) => {
            if (err) {
                throw Boom.badRequest(err);
            }
            user.update({password: hash})
                .then(user => res({ data: _.omit(user.dataValues, ['password']) }).code(200))
                .catch(error => Boom.badRequest(error));
        });} catch (e) {
        res(Boom.badRequest(e))
    }
};

export const setLastLogin = (req, res) => {
    let now = moment.utc();
    return User
        .findOne({
            where: {
                id: req.auth.credentials.id
            }
        })
        .then(user => {
            user
                .update({last_login: now}, {silent: true})
                .then(() => res({ data: user }).code(200))
                .catch((error) => Boom.badRequest(error))
        });
};

export const forgot_password = async (req, res) => {
    try {
        let user = await User.findOne({where: {email: req.payload.email}});
        if (!user)  res(Boom.badRequest('User not found'));
        else{
            let token = createToken(user);
            sendMail(token, user);
            res('Mail enviado')
        }
    } catch (err) {
        res(Boom.badRequest(err));
    }

};

const findUsersSubAboutToExpire = async () => {
    try{
        const now = moment(),
            future = now.clone().add(5, 'day').format('YYYY-MM-DD');
        let usersId = await Membership.findAll({
            where: {
                end_date: { [Op.lte]: future}
            },
            attributes: ['user_id'],
            group: ['user_id'],
        });
        let ids = [];
        for (let i = 0, len = usersId.length; i < len; i++) {
            ids.push(usersId[i].user_id);
        }
        let users = await User.findAll({where:{id:{[Op.in]: ids}}})
        return users;
    } catch (e) {
        throw new Error(e);
    }
};