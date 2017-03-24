export interface IReadOnlyService<T> {
    fetchAll() : Promise<T>;
}