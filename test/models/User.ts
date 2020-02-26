import { ModelBase, Primary, CreatedAt, Connection, Model } from "@spinajs/orm";
import { Datetime } from "../../src/decorators";

@Connection("sqlite")
@Model("user")
export class User extends ModelBase<User>
{
    @Primary()
    public Id: number;

    public Name: string;

    public Password: string;

    @Datetime()
    @CreatedAt()
    public CreatedAt: Date;
}