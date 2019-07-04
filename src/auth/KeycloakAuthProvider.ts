import * as express from 'express';
import {inject, injectable} from 'inversify';
import {interfaces} from 'inversify-express-utils';
import Keycloak from 'keycloak-connect';
import TYPE from '../constant/TYPE';
import {Role} from '../model/Role';
import logger from '../util/logger';
import {KeycloakService} from './KeycloakService';
import {User} from './User';
import {ApplicationConstants} from '../util/ApplicationConstants';

const keycloakService = inject(TYPE.KeycloakService);

@injectable()
export class KeycloakAuthProvider implements interfaces.AuthProvider {

    @keycloakService private readonly keycloakService: KeycloakService;

    public async getUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<interfaces.Principal> {
        if (req.method === 'OPTIONS') {
            return Promise.resolve(null);
        }
        if (!req.path.endsWith('healthz') && !req.path.endsWith('readiness') && !req.path.startsWith('/api-docs')) {
            const userId = req.get(ApplicationConstants.USER_ID);
            if (userId) {
                logger.debug('x-user-email detected. Checking if this user exists', {
                    email: userId,
                });
                const user: User = await this.keycloakService.getUser(userId);
                return Promise.resolve(user);
            } else {
                const instance: Keycloak = this.keycloakService.keycloakInstance();
                try {
                    const grant: Keycloak.Grant = await instance.getGrant(req, res);
                    // @ts-ignore
                    const email = grant.access_token.content.email;
                    const roles = grant.access_token.content.realm_access.roles.map((role: string) => {
                        return new Role({name: role});
                    });
                    const user = new User(email, email, roles);
                    return Promise.resolve(user);
                } catch (err) {
                    logger.warn('Failed to get user details', {
                        error: err.toString(),
                        url: req.url,
                        method: req.method,
                    });
                    return Promise.resolve(null);
                }
            }
        } else {
            return Promise.resolve(null);
        }
    }
}
