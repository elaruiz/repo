'use strict';

import Hapi from 'hapi';
import hapiCors from 'hapi-cors';
import { TOKEN_SECRET } from "./constants/index";
import routes from './routes';
import inert from 'inert';
import models from './models';
import moment from 'moment';

const server = new Hapi.Server();
const User = models.user;

// The connection object takes some
// configuration, including the port
server.connection({ host: process.env.HOST || 'localhost', port:  process.env.PORT || 8000, routes: { cors: true } });
export const host = server.info.uri;


server.register({
	register: hapiCors,
	options: {
		origins: ['*'],
        allowCredentials: 'true',
        exposeHeaders: ['content-type', 'content-length'],
        maxAge: 8440,
        methods: ['POST, GET, OPTIONS', 'PUT', 'PATCH', 'DELETE'],
        headers: [
            'Accept',
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept-Encoding',
            'Accept-Language'],
	}
});
server.register(inert, (err) => {
    
        if (err) {
            throw err;
        }
    });

server.register(require('hapi-auth-jwt2'), err => {
    let validate = async ( decodedToken, request, callback) => {
        try{
            let user = await User.findById(decodedToken.id);
            let changePassword = moment(user.dataValues.updated_at).valueOf();

            if (decodedToken.iat < changePassword) {
                return callback(null, false);
            }
            else if (decodedToken.iat > changePassword) {
                return callback(null, true)
            }
        }
        catch (error) {
            throw new Error(error)
        }

    };

    // We are giving the strategy a name of 'jwt'
    server.auth.strategy('jwt', 'jwt', 'required', {
        key: TOKEN_SECRET,
        validateFunc: validate,
        verifyOptions: {algorithms: ['HS512']}
    });
    
    server.route(routes);
});


export default server;