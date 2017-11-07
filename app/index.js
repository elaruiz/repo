'use strict';

import server from './server'
import models from './models';

models.sequelize.sync().then(() => server.start(() => {
    console.log(`App running at: ${server.info.uri}`);
})).catch((error) => { throw new Error(error)});


