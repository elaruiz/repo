import {
    findUser, retrieveUser, deleteUser, forgot_password, verifyCredentials,
    resetPassword, verifyUniqueUser, createUser, updateUser, findUsersSubAboutToExpire,
    findAllUsers, findUserById, updateUserInfo, updateUserPassword
} from "../controllers/UserController";
import {createToken, decodeToken} from "../util/token"
import {ErrorMsg} from "../util/responses";
import {authenticateUserSchema, createUserSchema, payloadSchema, editUserInfoSchema, editUserPasswordSchema} from "../schemas/UserSchema";
import _ from 'lodash';


const userRoute = {
    method: 'GET',
    path: '/api/users/me',
    config: {
        auth: 'jwt',
        handler: retrieveUser
    }
};

const forgotPasswordRoute = {
    method: 'POST',
    path: '/api/users/forgot-password',
    config: {
        auth: false,
        handler: forgot_password
    }
};

const loginUserRoute = {
    method: 'POST',
    path: '/api/users/login',
    config: {
        auth: false,
        pre: [{ method: verifyCredentials, assign: 'user' }],
        handler: (req, res) => {
            let user = _.omit(req.pre.user.dataValues, ['password']);
            res({user: { token: createToken(req.pre.user), data: user } }).code(200);
        },
        validate: {
            payload: authenticateUserSchema,
            failAction: (req,res,source, error) => res(ErrorMsg(error))
        }
    }
};

const resetPasswordRoute = {
    method: 'POST',
    path: '/api/users/reset-password',
    config: {
        pre: [{ method: decodeToken, assign: 'token' }],
        auth: false,
        handler: resetPassword
    }
};

const signupUserRoute = {
    method: 'POST',
    path: '/api/users',
    config: {
        auth: false,
        // Before the route handler runs, verify that the user is unique
        pre: [{ method: verifyUniqueUser }],
        handler: createUser,
        // Validate the payload against the Joi schema
        validate: {
            payload: createUserSchema,
            failAction: (req,res,source, error) => res(ErrorMsg(error))
        }
    }
};

const updateUserRoute ={
    method: ['PUT'],
    path: '/api/users/edit',
    config: {
        pre: [{ method: findUser,  assign: 'user' }],
        handler: updateUserInfo,
        validate: {
            payload: editUserInfoSchema,
            failAction: (req,res,source, error) => res(ErrorMsg(error))
        },
        auth: {
            strategy: 'jwt'
        }
    }
};

const updateUserPasswordRoute ={
    method: ['PUT'],
    path: '/api/users/change-password',
    config: {
        pre: [{ method: findUser,  assign: 'user' }],
        handler: updateUserPassword,
        validate: {
            payload: editUserPasswordSchema,
            failAction: (req,res,source, error) => res(ErrorMsg(error))
        },
        auth: {
            strategy: 'jwt'
        }
    }
};

const usersRoute = {
    method: 'GET',
    path: '/api/users',
    config: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: findAllUsers
    }
};

const userByIdRoute = {
    method: 'GET',
    path: '/api/user/{id}',
    config: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: findUserById
    }
};

const deleteUserRoute = {
    method: 'DELETE',
    path: '/api/user/{id}',
    config: {
        pre: [{ method: findUserById,  assign: 'user' }],
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: deleteUser,

    }
};

const updateUserIdRoute ={
    method: ['PATCH', 'PUT'],
    path: '/api/user/{id}',
    config: {
        pre: [{ method: findUserById,  assign: 'user' }],
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: updateUser,
        validate: {
            payload: payloadSchema,
            failAction: (req,res,source, error) => res(ErrorMsg(error))
        },

    }
};

export default [
    deleteUserRoute,
    loginUserRoute,
    signupUserRoute,
    updateUserRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
    userRoute,
    usersRoute,
    userByIdRoute,
    updateUserIdRoute,
    updateUserPasswordRoute
];