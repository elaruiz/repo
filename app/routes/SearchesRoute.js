import {
    deleteSearches,
    findMostWanted, findUserSearches, 
    searchByAddress,
    searchMunicipalities, searchProperty,
    searchProvinces, searchVias
} from "../controllers/SearchController";

const deleteSearchesRoute = {
    method: 'DELETE',
    path: '/api/user/{userId}/searches',
    config: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: deleteSearches,
    }
};

const readUserSearchesRoute = {
    method: 'GET',
    path: '/api/user/{userId}/searches',
    config: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: findUserSearches,
    }
};

const readSearchesRoute = {
    method: 'GET',
    path: '/api/searches',
    config: {
        auth: {
            strategy: 'jwt',
        },
        handler: findUserSearches,
    }
};

const readAllSearchesRoute = {
    method: 'GET',
    path: '/api/searches/most-wanted',
    config: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        handler: findMostWanted,
    }
};

const searchPropertyRoute = {
    method: 'GET',
    path: '/api/search/property/{referencia}',
    config: {
        auth: {
            strategy: 'jwt',
            mode: 'try'
        },
        handler: searchProperty,
    }
};

const searchByAddresRoute = {
    method: 'GET',
    path: '/api/search/address',
    config: {
        auth: {
            strategy: 'jwt',
            mode: 'try'
        },
        handler: searchByAddress,
    }
};

const searchMunicipalitiesRoute = {
    method: 'GET',
    path: '/api/search/municipalities/{name}',
    config: {
        auth: {
            strategy: 'jwt',
            mode: 'try'
        },
        handler: searchMunicipalities,
    }
};

const searchProvincesRoute = {
    method: 'GET',
    path: '/api/search/provinces',
    config: {
        auth: {
            strategy: 'jwt',
            mode: 'try'
        },
        handler: searchProvinces,
    }
};

const searchViasRoute = {
    method: 'GET',
    path: '/api/search/vias/{province}/{municipality}',
    config: {
        auth: {
            strategy: 'jwt',
            mode: 'try'
        },
        handler: searchVias
    }
};

export default [
    readUserSearchesRoute,
    deleteSearchesRoute,
    readSearchesRoute,
    readAllSearchesRoute,
    searchPropertyRoute,
    searchByAddresRoute,
    searchMunicipalitiesRoute,
    searchProvincesRoute,
    searchViasRoute
];