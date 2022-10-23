-- import to SQLite by running: sqlite3.exe db.sqlite3 -init sqlite.sql

PRAGMA journal_mode = MEMORY;
PRAGMA synchronous = OFF;
PRAGMA foreign_keys = OFF;
PRAGMA ignore_check_constraints = OFF;
PRAGMA auto_vacuum = NONE;
PRAGMA secure_delete = OFF;
BEGIN TRANSACTION;


CREATE TABLE `ability` (
`id` INTEGER NOT NULL ,
`name` TEXT  NOT NULL,
`nom` TEXT  DEFAULT NULL,
`description` text  DEFAULT NULL,
`usage_name` TEXT  NOT NULL,
`gen` INTEGER NOT NULL,
PRIMARY KEY (`id`)
);

INSERT INTO `ability` VALUES (269,'No Ability','Pas de capacités','Ne fait rien.','noability',1);
INSERT INTO `ability` VALUES (270,'No Ability','Pas de capacités','Ne fait rien.','noability',2);
INSERT INTO `ability` VALUES (271,'No Ability','Pas de capacités','Ne fait rien.','noability',3);

CREATE TABLE `item` (
`id` INTEGER NOT NULL ,
`name` TEXT  NOT NULL,
`nom` TEXT  DEFAULT NULL,
`description` text  DEFAULT NULL,
`usage_name` TEXT  NOT NULL,
`gen` INTEGER NOT NULL,
PRIMARY KEY (`id`)
);

INSERT INTO `item` VALUES (515,'Abomasite','Blizzarite','S''il est porté par un Blizzaroi, cet objet lui permet de méga-évoluer en combat.','abomasite',6);
INSERT INTO `item` VALUES (516,'Abomasite','Blizzarite','S''il est porté par un Blizzaroi, cet objet lui permet de méga-évoluer en combat.','abomasite',7);
INSERT INTO `item` VALUES (517,'Abomasite','Blizzarite','Indisponible dans cette génération.','abomasite',8);

CREATE TABLE `move` (
`id` INTEGER NOT NULL ,
`type_id` INTEGER DEFAULT NULL,
`name` TEXT  NOT NULL,
`nom` TEXT  DEFAULT NULL,
`description` text  DEFAULT NULL,
`pp` INTEGER NOT NULL,
`power` INTEGER DEFAULT NULL,
`accuracy` INTEGER DEFAULT NULL,
`category` TEXT  DEFAULT NULL,
`usage_name` TEXT  NOT NULL,
`gen` INTEGER NOT NULL,
PRIMARY KEY (`id`),
FOREIGN KEY (`type_id`) REFERENCES `type` (`id`)
);

INSERT INTO `move` VALUES (812,53,'10,000,000 Volt Thunderbolt','Giga-Tonnerre','Non disponible en génération 8',1,195,1,'Special','10000000voltthunderbolt',8);
INSERT INTO `move` VALUES (813,89,'Absorb','Vole-Vie','L''utilisateur récupère la moitié des PV perdus par la cible, arrondie à la moitié supérieure. Si l''utilisateur détient la Grosse Racine, les PV récupérés sont de 1,3x la normale, arrondis à la moitié inférieure.',25,20,100,'Special','absorb',7);
INSERT INTO `move` VALUES (814,88,'Absorb','Vole-Vie','L''utilisateur récupère la moitié des PV perdus par la cible, arrondie à la moitié supérieure. Si l''utilisateur détient la Grosse Racine, les PV récupérés sont de 1,3x la normale, arrondis à la moitié inférieure.',25,20,100,'Special','absorb',6);

COMMIT;
PRAGMA ignore_check_constraints = ON;
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
