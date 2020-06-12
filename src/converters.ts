import { DatetimeValueConverter, SetValueConverter } from '@spinajs/orm';

export class SqliteDatetimeValueConverter extends DatetimeValueConverter {
  public toDB(value: Date) {
    return value.toISOString();
  }

  public fromDB(value: string) {
    return new Date(value);
  }
}

export class SqliteSetValueConverter extends SetValueConverter {
  public toDB(value: any[]) {
    return value.join(",");
  }

  public fromDB(value: string) {
    return value.split(",");
  }
}


