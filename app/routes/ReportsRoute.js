import {
    createReport,
    findUserReport,
    findUserReports,
    checkUserReports,
    remainingReports,
    generateUserReport
} from "../controllers/ReportController";
import { generateGraphic } from "../controllers/GraphicController";


const createReportRoute = {
    method: 'POST',
    path: '/api/reports',
    config: {
        auth: {
            strategy: 'jwt',
        },
        handler: createReport,
    }
};

const readUserReportRoute = {
    method: 'GET',
    path: '/api/report/{id}',
    config: {
        auth: {
            strategy: 'jwt',
        },
        handler: findUserReport,
    }
};

const readUserReportsRoute = {
    method: 'GET',
    path: '/api/reports',
    config: {
        auth: {
            strategy: 'jwt',
        },
        handler: findUserReports,
    }
};

const generateReportRoute = {
    method: 'GET',
    path: '/api/reports/generate',
    config: {
        auth: {
            strategy: 'jwt',
        },
        pre: [{ method: checkUserReports, assign: 'reports' }],
        handler: remainingReports
    }
};

const getReportRoute = {
    method: 'POST',
    path: '/api/reports/property/{province}/{municipality}/{reference}',
    config: {
        auth: {
            strategy: 'jwt',
        },
        pre: [{ method: checkUserReports, assign: 'reports' }],
        handler: generateUserReport
    }
};

const generateGraphicRoute = {
    method: 'POST',
    path: '/api/reports/graphic',
    config: {
        auth: false,
        handler: generateGraphic
    }
};

export default [
    createReportRoute,
    readUserReportsRoute,
    readUserReportRoute,
    generateReportRoute,
    getReportRoute,
    generateGraphicRoute
];