import logger from '../util/logger';
import {provide} from 'inversify-binding-decorators';
import TYPE from '../constant/TYPE';
import KeycloakContext from './KeycloakContext';
import PromiseTimeoutHandler from './PromiseTimeoutHandler';
import {inject} from 'inversify';
import AppConfig from '../interfaces/AppConfig';

@provide(TYPE.DataContextPluginRegistry)
export default class DataContextPluginRegistry {

    private dataContextPlugin: any;

    constructor(@inject(TYPE.PromiseTimeoutHandler) private readonly promiseTimeoutHandler: PromiseTimeoutHandler,
                @inject(TYPE.AppConfig) private readonly appConfig: AppConfig) {

    }

    public register(plugin: any): void {
        if (!plugin.createDataContext && typeof plugin.createDataContext !== 'function') {
            logger.warn(`Plugin does not` +
                ` have createDataContext method...so ignoring registration`);
            return;
        }
        this.dataContextPlugin = plugin;
        logger.info(`Data context plugin registered`);
    }

    public async getDataContext(keycloakContext: KeycloakContext, processInstanceId?: string,
                                taskId?: string): Promise<any> {
        if (!this.dataContextPlugin) {
            return null;
        }
        try {
            const [dataContext] = await this.promiseTimeoutHandler.timeoutPromise('dataContext', Promise.all(
                [this.dataContextPlugin.createDataContext(keycloakContext, {
                    processInstanceId, taskId,
                })]));
            logger.info(`Data context resolved = ${dataContext !== null}`);
            return dataContext;
        } catch (e) {
            logger.error(`Unable to get data context due ${e.message ? e.message : e}`);
            return null;
        }
    }

    public async postProcess(dataContext, form) {
        return this.dataContextPlugin.postProcess(dataContext, form);
    }
    public getPlugin() {
        return this.dataContextPlugin;
    }
}
