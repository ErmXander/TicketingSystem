-- SQLite
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
    "admin" INTEGER NOT NULL,
	"hash"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "users" VALUES (1,'user1',0,'6adc75e03a75fe99c5aea6b7ff9d2d9cf7f3de2623ae865d18ee1e1120cf1c6f','1d11236f097a80fe');
INSERT INTO "users" VALUES (2,'user2',0,'5cbb5f1b364dbb481a10144e1e44edb0c6f01b40418361a0bbc553ae378b0794','d03b0f0fc9b64dff');
INSERT INTO "users" VALUES (3,'user3',0,'6ff1f3c755ed65d73bf1f11715f9bcd219ac53996f508751030a151fe44c0a85','4db8d277bfefb1e8');
INSERT INTO "users" VALUES (4,'admin1',1,'f53da53c794de085dc2c8c51b22f9e261e0b1b11f29222763ac24b17b27bb950','d430740d560dd99a');
INSERT INTO "users" VALUES (5,'admin2',1,'7400c8046d5d454c8d036d2e531f004b155b56727c8c119a3664c7e75da725ba','7d6cd84fd4a589ec');

CREATE TABLE IF NOT EXISTS "tickets" (
	"id"	INTEGER NOT NULL,
	"owner" INTEGER NOT NULL,
	"title"	TEXT NOT NULL,
	"state"	TEXT NOT NULL,
    "category" TEXT NOT NULL,
	"timestamp"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "tickets" VALUES (1,1,'support needed','closed','inquiry','2024-06-09T10:35:11');
INSERT INTO "tickets" VALUES (2,1,'feature proposal','open','new feature','2024-06-09T09:12:03');
INSERT INTO "tickets" VALUES (3,2,'credit card issue','open','payment','2024-05-13T22:10:13');
INSERT INTO "tickets" VALUES (4,2,'meaning of life','closed','inquiry','2024-06-01T11:45:58');
INSERT INTO "tickets" VALUES (5,4,'maintenance downtime','closed','maintenance','2023-12-20T10:45:01');
INSERT INTO "tickets" VALUES (6,4,'first ticket','open','administrative','2023-10-01T09:42:17');

CREATE TABLE IF NOT EXISTS "comments" (
	"id"	INTEGER NOT NULL,
	"ticket" INTEGER NOT NULL,
	"author" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
	"timestamp"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "comments" VALUES (1,1,1,'I am in dire need of support,
please help.','2024-06-09T09:12:03');
INSERT INTO "comments" VALUES (2,2,1,'I have tought of a cool new feature','2024-06-09T07:11:02');
INSERT INTO "comments" VALUES (3,3,2,'My payments are not going through','2024-05-13T22:10:13');
INSERT INTO "comments" VALUES (4,4,2,'I would like to know the meaning of life
the universe
and everything','2024-06-01T11:45:58');
INSERT INTO "comments" VALUES (5,5,4,'We will shut down the services for maintenance soon','2023-12-20T10:45:01');
INSERT INTO "comments" VALUES (6,6,4,'This is the first ticket  to test the system','2023-10-01T09:42:17');
INSERT INTO "comments" VALUES (7,6,5,'It works like a charm','2023-10-02T11:35:03');
INSERT INTO "comments" VALUES (8,6,3,'Indeed it
does work very well','2023-10-05T08:06:04');
INSERT INTO "comments" VALUES (9,4,3,'Have you tried looking into religion?','2024-07-01T03:03:33');
INSERT INTO "comments" VALUES (10,4,2,'I have found it:
it was 42','2024-07-15T07:06:42');

COMMIT;