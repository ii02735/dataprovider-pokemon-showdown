const path = require("path");
const { insertOrUpdate } = require("../../db/db");

describe("Testing description override after import", () => {
  let knex = null;
  let transaction = null;

  beforeEach(async () => {
    knex = require("knex")({
      client: "sqlite3", // or 'better-sqlite3'
      connection: {
        filename: path.join(
          __dirname,
          "./resources/sql/business_data_with_description/data.db"
        ),
      },
      useNullAsDefault: true,
    });

    transaction = await knex.transaction();
  });

  test("For ability table", async () => {
    try {
      // Updating manually the description
      await transaction("ability")
        .update({ description: "Ne fait rien UPDATE" })
        .where({ usage_name: "noability", gen: 3 });

      const abilities = [
        {
          name: "No Ability",
          nom: "Pas de capacités",
          gen: 1,
          usage_name: "noability",
          description: "Ne fait rien.",
        },
      ];
      // Launching import
      await insertOrUpdate(transaction, "ability", abilities, {
        hasGen: true,
        ignoreColumns: ["shortDescription"],
        replaceColumns: { usageName: "usage_name" },
        noOverrideColumns: ["description"],
      });

      const result = await transaction
        .select()
        .from("ability")
        .where({ usage_name: "noability", gen: 3 })
        .first();
      // The description should be what we've used for the manual update
      expect(result.description).not.toBe("Ne fait rien.");
      expect(result.description).toBe("Ne fait rien UPDATE");
    } catch (error) {
      console.log(error);
    }
  });

  test("For item table", async () => {
    try {
      // Updating manually the description
      await transaction("item")
        .update({ description: "Indisponible dans cette génération : UPDATE" })
        .where({ usage_name: "abomasite", gen: 8 });

      const items = [
        {
          name: "Abomasite",
          nom: "Blizzarite",
          gen: 8,
          usage_name: "abomasite",
          description: "Indisponible dans cette génération.",
        },
      ];
      // Launching import
      await insertOrUpdate(transaction, "item", items, {
        hasGen: true,
        replaceColumns: { usageName: "usage_name" },
        noOverrideColumns: ["description"],
      });

      const result = await transaction
        .select()
        .from("item")
        .where({ usage_name: "abomasite", gen: 8 })
        .first();
      // The description should be what we've used for the manual update
      expect(result.description).not.toBe(
        "Indisponible dans cette génération."
      );
      expect(result.description).toBe(
        "Indisponible dans cette génération : UPDATE"
      );
    } catch (error) {
      console.log(error);
    }
  });

  test("For move table", async () => {
    try {
      // Updating manually the description
      await transaction("move")
        .update({ description: "Non disponible en génération 8 : UPDATE" })
        .where({ usage_name: "10000000voltthunderbolt", gen: 8 });

      const moves = [
        {
          name: "10,000,000 Volt Thunderbolt",
          nom: "Giga-Tonnerre",
          gen: 8,
          usage_name: "10000000voltthunderbolt",
          description: "Non disponible en génération 8",
        },
      ];
      // Launching import
      await insertOrUpdate(transaction, "move", moves, {
        hasGen: true,
        replaceColumns: {
          type: "type_id",
          usageName: "usage_name",
        },
        ignoreColumns: ["shortDescription"],
        relations: {
          type_id: { table: "type", refColumn: "name" },
        },
        noOverrideColumns: ["description"],
      });

      const result = await transaction
        .select()
        .from("move")
        .where({ usage_name: "10000000voltthunderbolt", gen: 8 })
        .first();
      // The description should be what we've used for the manual update
      expect(result.description).not.toBe("Non disponible en génération 8");
      expect(result.description).toBe(
        "Non disponible en génération 8 : UPDATE"
      );
    } catch (error) {
      console.log(error);
    }
  });

  afterEach(async () => {
    await transaction.rollback(); // don't persist data
    await knex.destroy();
  });
});

describe("Testing description after translation", () => {
  let knex = null;
  let transaction = null;

  beforeEach(async () => {
    knex = require("knex")({
      client: "sqlite3", // or 'better-sqlite3'
      connection: {
        filename: path.join(
          __dirname,
          "./resources/sql/business_data_with_description/data.db"
        ),
      },
      useNullAsDefault: true,
    });

    transaction = await knex.transaction();
  });

  test("For ability table", async () => {
    try {
      await transaction("ability")
        .update({ description: "Ne fait rien UPDATE" })
        .where({ usage_name: "noability", gen: 3 });

      await transaction("ability")
        .update({ nom: "Pas de capacités UPDATE" })
        .where({ name: "No Ability" });

      const result = await transaction
        .select()
        .from("ability")
        .where({ usage_name: "noability", gen: 3 })
        .first();
      // The description should be what we've used for the manual update
      expect(result.description).toBe("Ne fait rien UPDATE");
      expect(result.description).not.toBe("Ne fait rien.");
      expect(result.nom).toBe("Pas de capacités UPDATE");
    } catch (error) {
      console.log(error);
    }
  });

  test("For item table", async () => {
    try {
      // Updating manually the description
      await transaction("item")
        .update({ description: "Indisponible dans cette génération : UPDATE" })
        .where({ usage_name: "abomasite", gen: 8 });

      await transaction("item")
        .update({ nom: "Blizzarite UPDATE" })
        .where({ name: "Abomasite" });

      const result = await transaction
        .select()
        .from("item")
        .where({ usage_name: "abomasite", gen: 8 })
        .first();
      // The description should be what we've used for the manual update
      expect(result.description).toBe(
        "Indisponible dans cette génération : UPDATE"
      );
      expect(result.description).not.toBe(
        "Indisponible dans cette génération."
      );
      expect(result.nom).toBe("Blizzarite UPDATE");
    } catch (error) {
      console.log(error);
    }
  });

  test("For move table", async () => {
    try {
      // Updating manually the description
      await transaction("move")
        .update({ description: "Non disponible en génération 8 : UPDATE" })
        .where({ usage_name: "10000000voltthunderbolt", gen: 8 });
      await transaction("move")
        .update({ nom: "Giga-Tonnerre UPDATE" })
        .where({ name: "10000000voltthunderbolt" });

      // The description should be what we've used for the manual update
      expect(result.description).not.toBe("Non disponible en génération 8");
      expect(result.description).toBe(
        "Non disponible en génération 8 : UPDATE"
      );
      expect(result.nom).toBe("Giga-Tonnerre UPDATE");
    } catch (error) {
      console.log(error);
    }
  });

  afterEach(async () => {
    await transaction.rollback(); // don't persist data
    await knex.destroy();
  });
});
