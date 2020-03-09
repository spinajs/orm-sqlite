import { NewInstance } from "@spinajs/di";
import { IQueryStatementResult, RawQuery } from "@spinajs/orm";
import { SqlJoinStatement } from "@spinajs/orm-sql";
import { JoinMethod } from "@spinajs/orm/lib/enums";
import { NotSupportedException } from "@spinajs/exceptions";

@NewInstance()
@NewInstance()
export class SqlLiteJoinStatement extends SqlJoinStatement {

    constructor(table: string | RawQuery, method: JoinMethod, foreignKey: string, primaryKey: string) {
        super(table, method, foreignKey, primaryKey);

        if (method === JoinMethod.RIGHT || method === JoinMethod.RIGHT_OUTER || method === JoinMethod.INNER || method === JoinMethod.FULL_OUTER) {
            throw new NotSupportedException(`join method ${method} is not supported by sqlite driver`);
        }
    }

    public build(): IQueryStatementResult {
        return {
            Bindings: [],
            Statements: [`\`${this._method}\` ${this._table} ON ${this._primaryKey} = ${this._foreignKey} `]
        }
    }
}