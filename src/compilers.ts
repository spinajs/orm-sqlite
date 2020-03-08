import { SqlColumnQueryCompiler, SqlTableQueryCompiler } from "@spinajs/orm-sql";
import { ICompilerOutput, OrderByBuilder, OrderByQueryCompiler } from "@spinajs/orm";
import { NewInstance, Inject, Container } from "@spinajs/di";
import _ = require("lodash");

@NewInstance()
export class SqliteOrderByCompiler extends OrderByQueryCompiler {

    protected _builder: OrderByBuilder;

    constructor(builder: OrderByBuilder) {
        super();

        if (!builder) {
            throw new Error('builder cannot be null or undefined');
        }

        this._builder = builder;
    }
    public compile(): ICompilerOutput {
        const sort = this._builder.getSort();
        let stmt = '';
        const bindings = [] as any;

        if (sort) {
            stmt = ` ORDER BY ${sort.column} ${sort.order.toLowerCase() === "asc" ? "ASC" : "DESC"}`;
        }

        return {
            bindings,
            expression: stmt,
        }
    }
}

@NewInstance()
@Inject(Container)
export class SqliteTableQueryCompiler extends SqlTableQueryCompiler {

    public compile(): ICompilerOutput {
        const _table = this._table();
        const _columns = this._columns();

        return {
            bindings: [],
            expression: `${_table} (${_columns})`
        }
    }
}

export class SqliteOnDuplicateQueryCompiler extends SqlOnDuplicateQueryCompiler{
    public compile(): ICompilerOutput {
        return {
            expression: `ON CONFLICT(${this._builder.Column}) DO UPDATE SET`,
            bindings: [] as any
        }
    }
}

@NewInstance()
export class SqliteColumnCompiler extends SqlColumnQueryCompiler {
    public compile(): ICompilerOutput {

        const _stmt: string[] = [];

        _stmt.push(`\`${this.builder.Name}\``);

        switch (this.builder.Type) {
            case "string":
            case "text":
            case "mediumtext":
            case "tinytext":
            case "longtext":
            case "date":
            case "dateTime":
            case "time":
                _stmt.push(`TEXT`);
                break;
            case "float":
            case "double":
                _stmt.push(`REAL`);
                break;
            case "decimal":
                _stmt.push(`DECIMAL`);
                break;
            case "int":
            case "tinyint":
            case "smallint":
            case "mediumint":
            case "bigint":
            case "boolean":
                _stmt.push("INTEGER");
                break;
        }

        if (this.builder.Unsigned) { _stmt.push("UNSIGNED"); }
        if (this.builder.Charset) { _stmt.push(`CHARACTER SET '${this.builder.Charset}'`); }
        if (this.builder.Collation) { _stmt.push(`COLLATE '${this.builder.Collation}'`); }
        if (this.builder.NotNull) { _stmt.push("NOT NULL"); }
        if (this.builder.Default) { _stmt.push(this._defaultCompiler()); }
        if (this.builder.Comment) { _stmt.push(`COMMENT '${this.builder.Comment}'`); }
        if (this.builder.PrimaryKey) { _stmt.push(`PRIMARY KEY`) };
        if (this.builder.AutoIncrement) { _stmt.push(`AUTOINCREMENT`); }
        if (this.builder.Unique) { _stmt.push("UNIQUE"); }

        return {
            bindings: [],
            expression: _stmt.filter(x => !_.isEmpty(x)).join(" "),
        }
    }
}