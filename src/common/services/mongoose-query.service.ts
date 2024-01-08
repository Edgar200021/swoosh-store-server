import { Document, Query, Types } from 'mongoose';
import { QueryParamsDto } from '../dto/query-params.dto';

export class MongooseQueryService<T, K extends Partial<QueryParamsDto>> {
  private readonly excludedFields = new Set([
    'page',
    'limit',
    'fields',
    'sort',
  ]);

  constructor(
    private query: Query<
      (Document<unknown, object, T> &
        T & {
          _id: Types.ObjectId;
        })[],
      Document<unknown, object, T> &
        T & {
          _id: Types.ObjectId;
        },
      object,
      T,
      'find'
    >,
    private readonly filterObj: K,
  ) {}

  filter() {}

  private excludeFields() {}
}
