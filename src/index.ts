export * from "./compilers";
export * from "./converters";
export * from "./decorators";

import { IColumnDescriptor, QueryContext, ColumnQueryCompiler, TableQueryCompiler, OrmDriver, QueryBuilder, TransactionCallback, OrderByQueryCompiler } from "@spinajs/orm";
import { Database } from "sqlite3";
import { SqlDriver } from "@spinajs/orm-sql";
import { Injectable, Container } from "@spinajs/di";
import { SqliteColumnCompiler, SqliteTableQueryCompiler, SqliteOrderByCompiler } from "./compilers";

@Injectable("orm-driver-sqlite")
export class SqliteOrmDriver extends SqlDriver {

    protected Db: Database;

    public execute(stmt: string, params: any[], queryContext: QueryContext): Promise<any> {

        const queryParams = params ?? [];

        if (!this.Db) {
            throw new Error("cannot execute sqlite statement, no db connection avaible");
        }

        super.execute(stmt, queryParams, queryContext);

        return new Promise((res, rej) => {

            switch (queryContext) {
                case QueryContext.Update:
                case QueryContext.Delete:
                case QueryContext.Schema:
                case QueryContext.Transaction:
                    this.Db.run(stmt, ...queryParams, (err: any, data: any) => {
                        if (err) {
                            rej(err);
                            return;
                        }

                        res(data);
                    });
                    break;
                case QueryContext.Select:
                    this.Db.all(stmt, ...queryParams, (err: any, rows: any) => {
                        if (err) {
                            rej(err);
                            return;
                        }

                        res(rows);
                    });
                    break;
                case QueryContext.Insert:
                    this.Db.run(stmt, ...queryParams, function (err: any) {
                        if (err) {
                            rej(err);
                            return;
                        }

                        res(this.lastID);
                    });
                    break;
            }


        });
    }

    public async ping(): Promise<boolean> {
        return this.Db !== null && this.Db !== undefined;
    }

    public async connect(): Promise<OrmDriver> {

        return new Promise((resolve, reject) => {
            this.Db = new Database(this.Options.Filename, (err) => {
                if (err) {
                    reject(err);
                    return;
                }



                resolve(this);
            });
        });
    }

    public async disconnect(): Promise<OrmDriver> {
        return new Promise((res, rej) => {
            this.Db.close((err) => {
                if (err) {
                    rej(err);
                    return;
                }

                this.Db = null;
                res(this);
            });
        })
    }

    public async resolve(container: Container) {
        super.resolve(container);

        this.Container = this.Container.child();
        this.Container.register(SqliteColumnCompiler).as(ColumnQueryCompiler);
        this.Container.register(SqliteTableQueryCompiler).as(TableQueryCompiler);
        this.Container.register(SqliteOrderByCompiler).as(OrderByQueryCompiler);
    }

    public async transaction(qrOrCallback: QueryBuilder[] | TransactionCallback) {

        if (!qrOrCallback) {
            return;
        }

        await this.execute("BEGIN TRANSACTION", null, QueryContext.Transaction);

        try {

            if (Array.isArray(qrOrCallback)) {
                for (const q of qrOrCallback) {
                    await q;
                }
            } else {
                await qrOrCallback(this);
            }

            await this.execute("COMMIT", null, QueryContext.Transaction);

        } catch (ex) {
            await this.execute("ROLLBACK", null, QueryContext.Transaction);
            throw ex;
        }
    }


    /**
     * 
     * Retrieves information about specific DB table if exists. If table not exists returns null
     * 
     * @param name table name to retrieve info
     * @param _schema - optional schema name
     * @returns {[] | null}
     */
    public async tableInfo(name: string, _schema?: string): Promise<IColumnDescriptor[]> {

        const result = await this.execute(`PRAGMA table_info(${name});`, null, QueryContext.Select) as [];

        if (!Array.isArray(result) || result.length === 0) {
            return null;
        }

        return result.map((r: any) => {
            return {
                Type: r.type,
                MaxLength: -1,
                Comment: "",
                DefaultValue: r.dflt_value,
                NativeType: r.type,
                Unsigned: false,
                Nullable: r.notnull === 1,
                PrimaryKey: r.pk === 1,
                AutoIncrement: false,
                Name: r.name,
                Converter: null,
                Schema: _schema ? _schema : this.Options.Database
            }
        });
    }
}