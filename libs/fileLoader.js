import path from "path";

export const PROVIDER = "PROVIDER";
export const LIBS = "LIBS";
export const JSON = "JSON";
export const USAGE = "USAGE";

export const loadResource = (resourceType, ...pathArray) => {
  switch (resourceType) {
    case this.LIBS:
      return import(path.join(__dirname, "..", "libs", ...pathArray));
    case this.PROVIDER:
      return import(path.join(__dirname, "..", "providers", ...pathArray));
    case this.JSON:
      return import(path.join(__dirname, "..", "json", ...pathArray));
    case this.USAGE:
      const { folderUsage } = loadResource(LIBS, "util");
      return import(path.join(__dirname, "..", folderUsage, ...pathArray));
  }
};
