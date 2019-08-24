import { IRepository } from "@yingyeothon/repository";
import { newInternalRepository } from "./builder";

export abstract class SimpleGetSetRepository<T> {
  protected readonly internal: IRepository;

  constructor(private readonly prefix: string, protected readonly id: string) {
    this.internal = newInternalRepository(`mist/${id}/`);
  }

  public async get() {
    return this.internal.get<T>(this.prefix);
  }

  public async set(value: T) {
    return this.internal.set<T>(this.prefix, value);
  }

  public async delete() {
    return this.internal.delete(this.prefix);
  }
}
