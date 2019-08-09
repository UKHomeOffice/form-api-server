import AppConfig from '../interfaces/AppConfig';
import {ApplicationConstants} from '../util/ApplicationConstants';

export const TWO_MINUTES = '120000';
const MAX_ENTRIES = 100;

const defaultAppConfig: AppConfig = {
    keycloak: {
        protocol: process.env.KEYCLOAK_PROTOCOL || 'http://',
        url: process.env.KEYCLOAK_URL || 'localhost',
        resource: process.env.API_FORM_KEYCLOAK_CLIENT_ID,
        bearerOnly: process.env.API_FORM_KEYCLOAK_BEARER_ONLY || 'true',
        realm: process.env.KEYCLOAK_REALM,
        confidentialPort: 0,
        sslRequired: 'external',
        tokenRefreshInterval: process.env.KEYCLOAK_TOKEN_REFRESH_INTERVAL || TWO_MINUTES,
        admin: {
            username: process.env.API_FORM_KEYCLOAK_ADMIN_USERNAME,
            password: process.env.API_FORM_KEYCLOAK_ADMIN_PASSWORD,
            clientId: process.env.API_FORM_KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
        },
    },
    admin: {
        roles: process.env.API_FORM_KEYCLOAK__ROLES ?
            process.env.API_FORM_KEYCLOAK_ROLES.split(',') : [],
    },
    cors: {
        origin: process.env.API_FORM_CORS_ORIGIN ? process.env.API_FORM_CORS_ORIGIN.split(',') : null,
    },
    log: {
        enabled: process.env.API_FORM_LOG_ENABLE_CHANGE ? process.env.API_FORM_LOG_ENABLE_CHANGE === 'true' : false,
        timeout: Number(process.env.API_FORM_LOG_CHANGE_TIMEOUT),
    },
    cache: {
        role: {
            maxAge: process.env.API_FORM_CACHE_ROLE_MAX_AGE ? +process.env.API_FORM_CACHE_ROLE_MAX_AGE : +TWO_MINUTES,
            maxEntries: process.env.API_FORM_CACHE_ROLE_MAX_ENTRIES ?
                +process.env.API_FORM_CACHE_USER_ROLE_ENTRIES : MAX_ENTRIES,
        },
        form: {
            maxAge: process.env.API_FORM_CACHE_FORM_MAX_AGE ? +process.env.API_FORM_CACHE_FORM_MAX_AGE : +TWO_MINUTES,
            maxEntries: process.env.API_FORM_CACHE_FORM_MAX_ENTRIES ?
                +process.env.API_FORM_CACHE_USER_FORM_ENTRIES : MAX_ENTRIES,
        },
        user: {
            maxAge: process.env.API_FORM_CACHE_USER_MAX_AGE ? +process.env.API_FORM_CACHE_USER_MAX_AGE : +TWO_MINUTES,
            maxEntries: process.env.API_FORM_CACHE_USER_MAX_ENTRIES ?
                +process.env.API_FORM_CACHE_USER_MAX_ENTRIES : MAX_ENTRIES,
        },
    },
    query: {
        log: {
            enabled: process.env.API_FORM_LOG_ENABLE_QUERY ? (process.env.API_FORM_LOG_ENABLE_QUERY === 'true') : false,
        },
    },
    correlationIdRequestHeader: process.env.API_FORM_CORRELATION_ID_REQUEST_HEADER
        || ApplicationConstants.DEFAULT_CORRELATION_REQUEST_ID,

};

export default defaultAppConfig;
