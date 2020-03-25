import { IValueConverter } from '@spinajs/orm';

export class DateTimeConverter implements IValueConverter {
  public toDB(value: Date) {
    return value.toISOString();
  }

  public fromDB(value: string) {
    return new Date(value);
  }
}
