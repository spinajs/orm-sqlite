import { Configuration } from "@spinajs/configuration";
import { join, normalize, resolve } from 'path';
import { SqliteOrmDriver } from "./../src/index";
import { DI } from "@spinajs/di";
import { SpinaJsDefaultLog, LogModule } from "@spinajs/log";
import { Orm } from "@spinajs/orm";
import * as _ from "lodash";
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User } from "./models/User";

const expect = chai.expect;
chai.use(chaiAsPromised);

export function dir(path: string) {
    return resolve(normalize(join(__dirname, path)));
}


export class ConnectionConf extends Configuration {

    protected conf = {
        system: {
            dirs: {
                models: [dir("./models")],
                migrations: [dir("./migrations")]
            }
        },
        db: {
            connections: [
                {
                    Driver: "orm-driver-sqlite",
                    Filename: ":memory:",
                    Name: "sqlite"
                }
            ]
        }
    }

    public get(path: string[], defaultValue?: any): any {
        return _.get(this.conf, path, defaultValue);
    }
}

function db() {
    return DI.get(Orm);
}

describe("Sqlite driver migration, updates, deletions & inserts", () => {

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SqliteOrmDriver).as("orm-driver-sqlite");
        DI.register(SpinaJsDefaultLog).as(LogModule);

        DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
    });

    it("Should migrate", async () => {

        await db().migrateUp();

        await db().Connections.get("sqlite").select().from("user");
        await expect(db().Connections.get("sqlite").select().from("notexistsd")).to.be.rejected;
     

    })

    it("should insert query", async () => {

        await db().migrateUp();
        const id = await db().Connections.get("sqlite").insert().into("user").values({
            Name: "test",
            Password: "test_password",
            CreatedAt: "2019-10-18"
        });

        const result = await db().Connections.get("sqlite").select().from("user").first();

        expect(id).to.eq(1);
        expect(result).to.be.not.null;
        expect((result as any).Id).to.eq(1);
        expect((result as any).Name).to.eq("test");
    });

    it("should delete", async () => {
        await db().migrateUp();
        await db().Connections.get("sqlite").insert().into("user").values({
            Name: "test",
            Password: "test_password",
            CreatedAt: "2019-10-18"
        });

        await db().Connections.get("sqlite").del().from("user").where("id", 1);

        const result = await db().Connections.get("sqlite").select().from("user").first();
        expect(result).to.be.undefined;
    });

    it("should update", async () => {
        await db().migrateUp();
        await db().Connections.get("sqlite").insert().into("user").values({
            Name: "test",
            Password: "test_password",
            CreatedAt: "2019-10-18"
        });

        await db().Connections.get("sqlite").update().in("user").update({
            Name: "test updated"
        }).where("id", 1);

        const result = await db().Connections.get("sqlite").select().from("user").first();
        expect(result).to.be.not.null;
        expect((result as any).Name).to.eq("test updated");
    });

});



describe("Sqlite driver migrate", () => {

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SqliteOrmDriver).as("orm-driver-sqlite");
        DI.register(SpinaJsDefaultLog).as(LogModule);

        DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
    });

    it("Should migrate", async () => {

        await db().migrateUp();
        await db().Connections.get("sqlite").insert().into("user").values({
            Name: "test",
            Password: "test_password",
            CreatedAt: "2019-10-18"
        })
        const result = await db().Connections.get("sqlite").select().from("user").first();

        expect(result).to.be.not.null;
        expect((result as any).Name).to.eq("test");
    })

    
});

describe("Sqlite queries", ()=>{

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SqliteOrmDriver).as("orm-driver-sqlite");
        DI.register(SpinaJsDefaultLog).as(LogModule);

        DI.resolve(LogModule);
        await DI.resolve(Orm);

        await db().migrateUp();
        await db().reloadTableInfo();
    });

    afterEach(async () => {
        DI.clear();
    });

    it("should select to model", async () => {
        await db().Connections.get("sqlite").insert().into("user").values({
            Name: "test",
            Password: "test_password",
            CreatedAt: "2019-10-18"
        });

        const user = await User.find<User>(1);

        expect(user).instanceOf(User);
        expect(user.Id).to.eq(1);
        expect(user.Name).to.eq("test");
    });

    it("should map datetime", async () => {
        await db().Connections.get("sqlite").insert().into("user").values({
            Name: "test",
            Password: "test_password",
            CreatedAt: "2019-10-18"
        });

        const user = await User.find<User>(1);

        expect(user).instanceOf(User);
        expect(user.CreatedAt).instanceof(Date);
    });
})