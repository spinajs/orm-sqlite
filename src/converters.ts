import { DatetimeValueConverter } from '@spinajs/orm';

export class SqliteDatetimeValueConverter extends DatetimeValueConverter {
  public toDB(value: Date) {
    return value.toISOString();
  }

  public fromDB(value: string) {
    return new Date(value);
  }
}


