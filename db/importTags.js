const { insertOrUpdate, knex, resultRecords } = require("./db");
const { loadResource, JSON } = require("../libs/fileLoader");
const tags = loadResource(JSON, "tags.json");
const guideTags = loadResource(JSON, "guide_tags.json");
const actualityTags = loadResource(JSON, "actuality_tags.json");
const videoTags = loadResource(JSON, "video_tags.json");
const tournamentTags = loadResource(JSON, "tournament_tags.json");

// Team
Promise.all(insertOrUpdate(knex, "tag", tags))
  .then((results) => console.log(resultRecords("tag", results)))
  .then(() =>
    // Guide
    Promise.all(insertOrUpdate(knex, "guideTag", guideTags))
  )
  .then((results) => console.log(resultRecords("guide_tag", results)))
  .then(() =>
    // Actuality
    Promise.all(insertOrUpdate(knex, "actualityTag", actualityTags))
  )
  .then((results) => console.log(resultRecords("actuality_tag", results)))
  .then(() =>
    // Tournament
    Promise.all(insertOrUpdate(knex, "tournamentTag", tournamentTags))
  )
  .then((results) => console.log(resultRecords("tournament_tag", results)))
  .then(() =>
    // Video
    Promise.all(insertOrUpdate(knex, "video_tag", videoTags))
  )
  .then((results) => console.log(resultRecords("video_tag", results)))
  .catch((err) => console.log(err))
  .finally(() => knex.destroy());
