export default class Provider {
  /**
   * @param {ModdedDex} dex
   */
  constructor(dex) {
    this.collection = [];
    this.dex = dex;
  }

  /**
   *
   * @param rawObject
   * @param {number|null} gen
   * @return {never|{}}
   */
  makeObject(rawObject, gen) {
    throw new Error("Not yet implemented");
  }

  provideCollection() {
    throw new Error("Not yet implemented");
  }

  getCollection() {
    return [...this.collection];
  }
}
