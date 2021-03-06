import 'reflect-metadata';
import {expect} from "chai";
import {AdminController} from "../../../src/controller";
import {FormService} from "../../../src/service/FormService";
import {FormResourceAssembler} from "../../../src/controller/FormResourceAssembler";
import {MockResponse} from "../../MockResponse";
import {MockRequest} from "../../MockRequest";
import {Arg, Substitute, SubstituteOf} from "@fluffy-spoon/substitute";
import {FormVersion} from "../../../src/model/FormVersion";
import logger from "../../../src/util/logger";
import AppConfig from "../../../src/interfaces/AppConfig";
import defaultAppConfig from "../../../src/config/defaultAppConfig";
import ResourceValidationError from "../../../src/error/ResourceValidationError";
import {KeycloakService} from "../../../src/auth/KeycloakService";
import {User} from "../../../src/auth/User";
import {EventEmitter} from "events";
import {SequelizeProvider} from "../../../src/model/SequelizeProvider";
import {ApplicationConstants} from "../../../src/constant/ApplicationConstants";
import CacheManager from "type-cacheable/dist/CacheManager";
import {CacheClient} from "type-cacheable/lib/interfaces/CacheClient";


describe('AdminController', () => {

    const env = Object.assign({}, process.env);

    after(() => {
        process.env = env;
    });

    let mockResponse: any;
    let mockRequest: any;
    let underTest: AdminController;
    let formService: FormService;
    let formResourceAssembler: FormResourceAssembler;
    let keycloakService: KeycloakService;
    let appConfig: AppConfig;
    let eventEmitter: EventEmitter;
    let sequelizeProvider: SequelizeProvider;
    let cacheManager: SubstituteOf<CacheManager>;

    beforeEach(() => {
        mockResponse = new MockResponse();
        mockRequest = new MockRequest("/forms", "/api/v1");
        formService = Substitute.for<FormService>();
        formResourceAssembler = Substitute.for<FormResourceAssembler>();
        keycloakService = Substitute.for<KeycloakService>();
        cacheManager = Substitute.for<CacheManager>();
        eventEmitter = new EventEmitter();
        sequelizeProvider = Substitute.for<SequelizeProvider>();
        defaultAppConfig.log.enabled = true;
        defaultAppConfig.log.timeout = 200;
        appConfig = defaultAppConfig;

        underTest = new AdminController(formService, keycloakService, eventEmitter,
            sequelizeProvider,
            appConfig, cacheManager);

    });

    it('can return forms', async () => {
        Object.assign(FormVersion, {});
        const version: FormVersion = Object.assign(FormVersion.prototype, {});
        version.schema = {
            display: 'form',
            components: []
        };
        // @ts-ignore
        formService.allForms(Arg.any(), Arg.any()).returns(Promise.resolve({total: 1, versions: [version]}));

        await underTest.allForms(mockRequest, mockResponse);

        expect(mockResponse.getJsonData().total).to.be.eq(1);
        expect(mockResponse.getJsonData().versions.length).to.be.eq(1);

    });

    it('can change log level', (done) => {
        const transportStream = logger.transports[0];
        expect(transportStream.level).to.be.eq('info');
        underTest.changeLogLevel({level: 'debug'}, mockResponse);
        expect(transportStream.level).to.be.eq('debug');

        setTimeout(() => {
            expect(logger.transports[0].level).to.be.eq('info');
            done();
        }, 300);
    });
    it('cannot change log level', () => {
        appConfig.log.enabled = false;
        underTest.changeLogLevel({level: 'info'}, mockResponse);
        expect(mockResponse.getStatus()).to.be.eq(403);
    });
    it('throws exception if log level invalid', () => {
        try {
            underTest.changeLogLevel({level: 'xsdsd'}, mockResponse);
        } catch (e) {
            expect(e instanceof ResourceValidationError).to.be.eq(true);
        }
    });
    it('does not apply timeout if -1', (done) => {
        appConfig.log.timeout = -1;
        const transportStream = logger.transports[0];
        expect(transportStream.level).to.be.eq('info');

        underTest.changeLogLevel({level: 'debug'}, mockResponse);
        expect(transportStream.level).to.be.eq('debug');

        setTimeout(() => {
            expect(transportStream.level).to.be.eq('debug');
            done();
        }, 500);
    });
    it('can delete cache', () => {
        const user: User = new User("email", "email", []);
        underTest.clearUserCache(mockResponse, user);
        // @ts-ignore
        keycloakService.received().clearUserCache(user);
    });

    it('can delete form cache', async () => {
        const user: User = new User("email", "email", []);
        const cacheClient: SubstituteOf<CacheClient> = Substitute.for<CacheClient>();
        cacheManager.client.returns(cacheClient);

        await underTest.clearFormCache('id', user, mockResponse);

        cacheClient.received(1).del(FormService.setCacheKey(['id']));

    });
    it('can change query log level', () => {
        const user: User = new User("email", "email", []);
        underTest.enableQueryLogging(mockResponse, user);
    });

    it('can delete query log level', () => {
        const user: User = new User("email", "email", []);
        underTest.disableQueryLogging(mockResponse, user);
    });

    it('can perform hard delete', async () => {
        const user: User = new User("email", "email", []);
        await underTest.hardDelete("id", mockResponse, user);
        // @ts-ignore
        formService.received().purge("id", user);
        expect(mockResponse.getStatus()).to.be.eq(200);
    });

    it('can perform clearTimeout', () => {
        underTest.changeLogLevel({level: 'debug'}, mockResponse);
        expect(underTest.timeoutId._destroyed).to.be.eq(false);

        underTest.clearTimeout();
        expect(underTest.timeoutId._destroyed).to.be.eq(true);

    });
    it('can handle application shutdown', () => {
        underTest.changeLogLevel({level: 'debug'}, mockResponse);
        expect(underTest.timeoutId._destroyed).to.be.eq(false);

        eventEmitter.emit(ApplicationConstants.SHUTDOWN_EVENT);

        expect(underTest.timeoutId._destroyed).to.be.eq(true);

    })
});
