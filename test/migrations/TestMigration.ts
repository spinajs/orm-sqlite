import { OrmMigration, OrmDriver, Migration } from "@spinajs/orm";

@Migration("sqlite")
export class TestMigration extends OrmMigration
{
    public async up(connection:  OrmDriver): Promise<void> {

        await connection.schema().createTable("user", (table)=>{
            table.int("Id").primaryKey().autoIncrement();
            table.string("Name").notNull();
            table.string("Password").notNull();
            table.dateTime("CreatedAt").notNull();
        });
        
    }   
    
    // tslint:disable-next-line: no-empty
    public async down(_connection: OrmDriver): Promise<void> {
        
    }
}