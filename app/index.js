'use strict';

import server from './server'
import models from './models';

models.sequelize.sync();

server.start(() => {
    console.log(`App running at: ${server.info.uri}`);
});
