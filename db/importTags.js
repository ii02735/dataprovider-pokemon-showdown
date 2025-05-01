import { insertOrUpdate, knex, resultRecords } from "./db";
import { loadResource, JSON as CONST_JSON } from "../libs/fileLoader";
const tags = loadResource(CONST_JSON, "tags.json");
const guideTags = loadResource(CONST_JSON, "guide_tags.json");
const actualityTags = loadResource(CONST_JSON, "actuality_tags.json");
const videoTags = loadResource(CONST_JSON, "video_tags.json");
const tournamentTags = loadResource(CONST_JSON, "tournament_tags.json");

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
