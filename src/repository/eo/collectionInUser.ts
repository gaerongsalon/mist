import { IIndexTuple, IUser } from "..";

type ArrayKeySelector<T> = {
  [P in keyof T]-?: T[P] extends any[] ? P : never;
}[keyof T];

const filterByIndex = (index: number) => <T extends IIndexTuple>(each: T) =>
  each.index === index;

export class CollectionInUser<T extends IIndexTuple> {
  constructor(
    protected readonly user: IUser,
    private readonly name: ArrayKeySelector<IUser>
  ) {}

  public get elements(): T[] {
    return (this.user[this.name] as any[]) as T[];
  }

  public find(predicate: (each: T) => boolean) {
    return this.elements.find(predicate);
  }

  public filter(predicate: (each: T) => boolean) {
    return this.elements.filter(predicate);
  }

  public findByIndex(index: number) {
    return this.find(filterByIndex(index));
  }

  public add(fields: Omit<T, "index">) {
    const insertId = Math.max(...this.elements.map(each => each.index), 0) + 1;
    const newTuple = {
      ...fields,
      index: insertId
    } as T;
    this.elements.push(newTuple);
  }

  public remove(index: number) {
    this.removeWhere(filterByIndex(index));
  }

  public removeWhere(predicate: (each: T) => boolean) {
    this.user[this.name] = this.elements.filter(
      each => !predicate(each)
    ) as any[];
  }
}
