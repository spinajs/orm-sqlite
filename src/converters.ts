import { DatetimeValueConverter, SetValueConverter } from '@spinajs/orm';

export class SqliteDatetimeValueConverter extends DatetimeValueConverter {
  public toDB(value: Date) {
    if(value instanceof Date)
    {
      return value.toISOString();
    }

    return null;
  }

  public fromDB(value: string) {
    return new Date(value);
  }
}

 

