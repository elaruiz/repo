import Boom from 'boom';

const exporter = require('highcharts-export-server');

export const generateGraphic = (req,res) => {
    const options = req.payload.options;

    let exportSettings = {
        type: 'png',
        width: 1280,
        options
    };
    exporter.initPool();
    exporter.export(exportSettings, (err, chart) => {
        exporter.killPool();
        if(!err) {
            res({data: chart.data}).code(200);
        }else{
            res(Boom.badImplementation());
        }
    })
};