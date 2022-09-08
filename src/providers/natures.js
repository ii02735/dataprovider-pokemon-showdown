import Provider from "./provider.js";

export default class NaturesProvider extends Provider {
  constructor(dex) {
    super(dex);
  }

  provideCollection() {
    this.dex.natures.all().forEach((value) => {
      this.collection.push(this.makeObject(value));
    });
  }

  makeObject(rawObject) {
    const nature = { usageName: rawObject.id, name: rawObject.name };
    const { plus, minus } = rawObject;
    if (!!plus) nature[plus] = 1;
    if (!!minus) nature[minus] = -1;
    return nature;
  }
}
