import { DatetimeValueConverter } from '@spinajs/orm';

export class SqliteDatetimeValueConverter extends DatetimeValueConverter {
  public toDB(value: Date) {
    if (value instanceof Date) {
      return this.toIsoString(value);
    }

    return null;
  }

  public fromDB(value: string) {
    if (!value) {
      return null;
    }

    return new Date(value);
  }

  public toIsoString(date: Date) {
    const tzo = -date.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';
    const pad = (num: number) => {
      const norm = Math.floor(Math.abs(num));
      return (norm < 10 ? '0' : '') + norm;
    };
    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      dif + pad(tzo / 60) +
      ':' + pad(tzo % 60);
  }
}
