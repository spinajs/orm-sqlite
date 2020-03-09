import { extractDecoratorDescriptor, IModelDescrtiptor } from "@spinajs/orm";
import { DateTimeConverter } from "./converters";

export function Datetime() {
    return extractDecoratorDescriptor((model: IModelDescrtiptor, target: any, propertyKey: string) => {
        const type = Reflect.getMetadata('design:type', target, propertyKey);
        if (type.name !== "Date") {
            throw Error(`Proprety  ${propertyKey} must be Date type`);
        }

        if (!model.Columns) {
            model.Columns = [];
        }

        model.Columns.push({
            Type: "TEXT",
            MaxLength: 0,
            Comment: "",
            DefaultValue: null,
            NativeType: "TEXT",
            Unsigned: false,
            Nullable: true,
            PrimaryKey: false,
            AutoIncrement: false,
            Name: "CreatedAt",
            Converter: new DateTimeConverter(),
            Schema: "test",
            Unique: false
        })

    }, true);
}