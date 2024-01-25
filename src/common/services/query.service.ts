import { QueryParamsDto } from "../dto/query-params.dto";


export  class QueryService{


  static  excludeFields<T extends Partial<QueryParamsDto>>(obj: T) {
    const fields = new Set(['sort', 'fields', 'page', 'limit']);

    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => !fields.has(key)),
    );
  }
  static   transformFilterObj<T>(queryObj: { [key in keyof T]: T[key] }) {
    const map = new Map(Object.entries(queryObj));
    const symbols = {
      '<=': '$lte',
      '>=': '$gte',
      '>': '$gt',
      '<': '$lt',
    };

    map.forEach((_, key) => {
      const regex = key.match(new RegExp(Object.keys(symbols).join('|')));

      if (!regex) {
        return;
      }

      const prefix = key.slice(0, regex.index);

      if (map.has(prefix)) {
        map.get(prefix)[symbols[regex[0]]] = map.get(key);
        map.delete(key);
        return;
      }

      map.set(prefix, {});
      map.set(prefix, { [symbols[regex[0]]]: map.get(key) });
      map.delete(key);
    });

    return Object.fromEntries(map) as T;
  }
}