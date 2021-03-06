import { Menu, MittagApiResult } from './mittag-api-result';

export interface IReadOnlyService<T> {
    fetchAll() : Promise<T>;
}

export interface IMittagService<MittagApiResult> {
    fetchDefaults() : Promise<Array<Menu>>;
}
