import TYPE from "../../../src/constant/TYPE";
import {expect} from 'chai';
import {FormService} from "../../../src/service/FormService";
import {applicationContext} from "../setup-test";
import {FormRepository} from "../../../src/types/repository";
import {Role} from "../../../src/model/Role";
import {FormVersion} from "../../../src/model/FormVersion";
import {Op} from "sequelize";
import {User} from "../../../src/model/User";

import ResourceNotFoundError from "../../../src/error/ResourceNotFoundError";
import ValidationError from "../../../src/error/ValidationError";

describe("FormService", () => {

    it('appcontext loads service and repository', async () => {
        const formService: FormService = applicationContext.get(TYPE.FormService);
        expect(formService).to.be.not.null;
        expect(formService.formRepository).to.be.not.null;
        expect(formService.formRepository.name).to.be.eq('Form');
    });


    it('can create multiple versions', async () => {
        const formRepository: FormRepository = applicationContext.get(TYPE.FormRepository);
        const formService: FormService = applicationContext.get(TYPE.FormService);

        const role = await new Role({
            name: "Test Role",
            title: "Test title",
            active: true
        }).save();
        const form = await formRepository.create({
            createdBy: "test@test.com"
        });
        await form.$add("roles", [role]);

        await new FormVersion({
            name: "Test Form 123",
            title: "Test form title",
            schema: {
                components: [],
                display: "wizard"
            },
            formId: form.id,
            current: true
        }).save();

        const result: { offset: number, limit: number, data: FormVersion[], total: number }
            = await formService.findAllVersions(form.id, 0, 10);

        expect(result.total).to.eq(1);
        expect(result.offset).to.eq(0);
        expect(result.limit).to.eq(10);
        expect(result.data.length).to.eq(1);
    });

    it('can get latest form version', async () => {
        const formRepository: FormRepository = applicationContext.get(TYPE.FormRepository);
        const formService: FormService = applicationContext.get(TYPE.FormService);

        const role = await new Role({
            name: "Test Role XXX",
            title: "Test title",
            active: true
        }).save();
        const form = await formRepository.create({
            createdBy: "test@test.com"
        });
        await form.$add("roles", [role]);

        await new FormVersion({
            name: "Test Form ABC 123",
            title: "Test form title",
            schema: {
                components: [],
                display: "wizard"
            },
            formId: form.id,
            latest: true,
            inDate: new Date(),
            outDate: new Date()
        }).save();

        const lastVersion: FormVersion = await new FormVersion({
            name: "Test Form ABC 123",
            title: "Test form title",
            schema: {
                components: [],
                display: "wizard"
            },
            formId: form.id,
            latest: true,
            inDate: new Date(),
            outDate: null
        }).save();
        const user = new User("id", "test", [role]);
        const result: FormVersion = await formService.findForm(form.id, user);
        expect(result).to.be.not.null;
        expect(result.id).to.be.eq(lastVersion.id);
        expect(result.latest).to.be.eq(true);
        expect(result.outDate).to.be.null;
        expect(result.form).to.be.not.null;
        expect(result.form.roles.length).to.be.eq(1);
        expect(result.form.roles[0].name).to.be.eq("Test Role XXX")
    });

    it('can restore a version', async () => {

        const formRepository: FormRepository = applicationContext.get(TYPE.FormRepository);
        const formService: FormService = applicationContext.get(TYPE.FormService);

        const role = await new Role({
            name: "Test Role XX12",
            title: "Test title",
            active: true
        }).save();
        const form = await formRepository.create({
            createdBy: "test@test.com"
        });
        await form.$add("roles", [role]);

        const oldVersion = await new FormVersion({
            name: "Test Form ABC 123",
            title: "Test form title",
            schema: {
                components: [],
                display: "wizard"
            },
            formId: form.id,
            latest: true,
            inDate: new Date(),
            outDate: new Date()
        }).save();

        const lastVersion: FormVersion = await new FormVersion({
            name: "Test Form ABC 123",
            title: "Test form title",
            schema: {
                components: [],
                display: "wizard"
            },
            formId: form.id,
            latest: true,
            inDate: new Date(),
            outDate: null
        }).save();


        const latest: FormVersion = await formService.restore(form.id, oldVersion.id);

        expect(latest.id).to.eq(oldVersion.id);
        expect(latest.outDate).to.be.null;
        expect(latest.latest).to.be.eq(true);

        const user = new User("id", "test", [role]);
        const loaded: FormVersion = await formService.findForm(form.id, user);
        expect(loaded.id).to.be.eq(latest.id);

        const result = await FormVersion.findOne({
            where: {
                id: {[Op.eq]: lastVersion.id}
            }
        });
        expect(result.outDate).to.be.not.null;
        expect(result.latest).to.be.eq(false);

    });


    it('form not returned if user does not have role', async () => {
        const formRepository: FormRepository = applicationContext.get(TYPE.FormRepository);
        const formService: FormService = applicationContext.get(TYPE.FormService);

        const role = await new Role({
            name: "Test Role XX13",
            title: "Test title",
            active: true
        }).save();
        const form = await formRepository.create({
            createdBy: "test@test.com"
        });
        await form.$add("roles", [role]);

        await new FormVersion({
            name: "Test Form ABC 123",
            title: "Test form title",
            schema: {
                components: [],
                display: "wizard"
            },
            formId: form.id,
            latest: true,
            inDate: new Date(),
            outDate: null
        }).save();

        const anotherRole = await new Role({
            name: "Test Role For User",
            title: "Test title",
            active: true
        }).save();
        const user = new User("id", "test", [anotherRole]);
        const loaded: FormVersion = await formService.findForm(form.id, user);
        expect(loaded).to.be.null;
    });
    it('can get form if all role attached to form', async () => {
        const formRepository: FormRepository = applicationContext.get(TYPE.FormRepository);
        const formService: FormService = applicationContext.get(TYPE.FormService);

        const form = await formRepository.create({
            createdBy: "test@test.com"
        });
        const defaultRole = await new Role({
            name: "all",
            title: "Test title",
            active: true
        }).save();
        await form.$add("roles", [defaultRole]);

        await new FormVersion({
            name: "Test Form ABC 123",
            title: "Test form title",
            schema: {
                components: [],
                display: "wizard"
            },
            formId: form.id,
            latest: true,
            inDate: new Date(),
            outDate: null
        }).save();

        const anotherRole = await new Role({
            name: "User role",
            title: "Test title",
            active: true
        }).save();

        const user = new User("id", "test", [anotherRole]);
        const loaded: FormVersion = await formService.findForm(form.id, user);
        expect(loaded).to.be.not.null;
    });
    it('expected to throw resource not found exception', async () => {
        const formService: FormService = applicationContext.get(TYPE.FormService);

        try {
            await formService.restore("randomId", "randomID")
        } catch (e) {
            expect(e instanceof ResourceNotFoundError).to.eq(true);
        }

    });
    it('expected to throw resource not version does not exist', async () => {
        const formRepository: FormRepository = applicationContext.get(TYPE.FormRepository);
        const formService: FormService = applicationContext.get(TYPE.FormService);

        try {
            const role = await new Role({
                name: "Test Role New One two three",
                title: "Test title",
                active: true
            }).save();
            const form = await formRepository.create({
                createdBy: "test@test.com"
            });
            await form.$add("roles", [role]);

            await new FormVersion({
                name: "Test Form ABC 123",
                title: "Test form title",
                schema: {
                    components: [],
                    display: "wizard"
                },
                formId: form.id,
                latest: true,
                inDate: new Date(),
                outDate: null
            }).save();
            await formService.restore(form.id, "randomID")
        } catch (e) {
            expect(e instanceof ResourceNotFoundError).to.eq(true);
        }
    });

    it('can get all forms', async () => {
        const formRepository: FormRepository = applicationContext.get(TYPE.FormRepository);
        const formService: FormService = applicationContext.get(TYPE.FormService);

        const role = await new Role({
            name: "ABC",
            title: "Test title",
            active: true
        }).save();

        await formRepository.sequelize.transaction(async (transaction: any) => {
            const value = 1;
            const index = 1;
            const form = await formRepository.create({
                createdBy: `test${value}@test.com`
            });
            await form.$add("roles", [role]);

            const formName = `Test Form ABC${index}${value}`;
            await new FormVersion({
                name: formName,
                title: "Test form title",
                schema: {
                    components: [],
                    display: "wizard"
                },
                formId: form.id,
                latest: false,
                inDate: new Date(),
                outDate: new Date()
            }).save();

            await new FormVersion({
                name: formName,
                title: "Test form title",
                schema: {
                    components: [],
                    display: "wizard"
                },
                formId: form.id,
                latest: true,
                inDate: new Date(),
                outDate: null
            }).save();
        });
        await formRepository.sequelize.transaction(async (transaction: any) => {
            const value = 1;
            const index = 1;
            const form = await formRepository.create({
                createdBy: `test${value}@test.com`
            });
            await form.$add("roles", [role]);

            const formName = `Test Form ABC${index}${value}Y`;
            await new FormVersion({
                name: formName,
                title: "Test form title",
                schema: {
                    components: [],
                    display: "wizard"
                },
                formId: form.id,
                latest: false,
                inDate: new Date(),
                outDate: new Date()
            }).save();

            await new FormVersion({
                name: formName,
                title: "Test form title",
                schema: {
                    components: [],
                    display: "wizard"
                },
                formId: form.id,
                latest: true,
                inDate: new Date(),
                outDate: null
            }).save();
        });

        await formRepository.sequelize.transaction(async (transaction: any) => {
            const value = 2;
            const index = 2;

            const anotherRole = await new Role({
                name: "Test Role For User Xyz + 1 + 2",
                title: "Test title",
                active: true
            }).save();

            const form = await formRepository.create({
                createdBy: `test${value}@test.com`
            });

            await form.$add("roles", [anotherRole]);

            const formName = `Test Form ABC${index}${value}X`;
            await new FormVersion({
                name: formName,
                title: "Test form title",
                schema: {
                    components: [],
                    display: "wizard"
                },
                formId: form.id,
                latest: false,
                inDate: new Date(),
                outDate: new Date()
            }).save();

            await new FormVersion({
                name: formName,
                title: "Test form title",
                schema: {
                    components: [],
                    display: "wizard"
                },
                formId: form.id,
                latest: true,
                inDate: new Date(),
                outDate: null
            }).save();
        });
        const results: { total: number, forms: FormVersion[] } = await formService.getAllForms(new User("id", "test", [role]));
        expect(results.total).to.be.gte(2);
        expect(results.forms.length).to.be.gte(2);
    });

    it('can create custom role on creating form', async () => {
        const formRepository: FormRepository = applicationContext.get(TYPE.FormRepository);
        const role = new Role({
            name: "ontheflyrole",
            title: "Test title",
            active: true
        });
        const form = await formRepository.create({
            createdBy: `test@test.com`,
            roles: [role]
        }, {
            include: [{
                model: Role
            }]
        });
        expect(form.roles.length).to.eq(1);
        const loadedRole = await Role.findOne({
            where: {
                name: {
                    [Op.eq]: role.name
                }
            }
        });
        expect(loadedRole.name).to.eq(role.name);
    });

    it('fails validation on create', async () => {
        const formService: FormService = applicationContext.get(TYPE.FormService);
        const role = new Role({
            name: "Test Role New One two three",
            title: "Test title",
            active: true
        });
        const user = new User("id", "test", [role]);
        try {
            await formService.create(user, {});
        } catch (err) {
            expect(err instanceof ValidationError).to.eq(true);
            const validationError = err as ValidationError;
            expect(validationError.get().length).to.be.eq(3);
        }
    });
});



