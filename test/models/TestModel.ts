import { ModelBase, Primary, Connection, Model } from "@spinajs/orm";
import { Datetime } from "../../src/decorators";

@Connection("sqlite")
@Model("test_model")
export class TestModel extends ModelBase<TestModel>
{
    @Primary()
    public Id: number;

    @Datetime()
    public CreatedAt: Date;
}