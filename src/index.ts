import { createServer } from "node:http";
import { join } from "node:path"
import { createApp, createRouter, defineEventHandler, readBody, sendRedirect, toNodeListener } from "h3";
import { Eta } from "eta"
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { pino, Logger } from "pino";

export const app = createApp();

const router = createRouter();

const logger: Logger = pino({
    level: "info",
});

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const eta = new Eta({ views: join(__dirname, '../src', "templates") })

const db = new Database(join(__dirname, 'app-0.db'));
db.pragma('journal_mode = WAL');

app.use(router);

// Add a new route that matches GET requests to / path
router.get(
    "/",
    defineEventHandler((event) => {
        const html = eta.render('home', {})

        logger.info("Hit the home route")

        return html;
    }),
);

router.get("/setup-db", defineEventHandler((event) => {
    db.prepare("CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, name TEXT,description TEXT, github_url TEXT);").run();

    return "Database setup!";
}));

router.get("/seed-db", defineEventHandler((event) => {
    db.prepare("DELETE FROM projects").run();
    db.prepare("INSERT INTO projects (name, description, github_url) VALUES (?, ?, ?)").run("Poirot", "Poirot is an open source server resource monitoring tool. Monitor CPU, Memory, Disk space and other resources.", "https://github.com/vizalo/poirot");
    db.prepare("INSERT INTO projects (name, description, github_url) VALUES (?, ?, ?)").run("App-0", "App-0 is this web app which was built to demo Vizalo managed apps.", "https://github.com/vizalo/app-0");

    return "Database seeded!";
}));

router.get(
    "/oss",
    defineEventHandler((event) => {
        const projects = db.prepare("SELECT * FROM projects").all();

        const html = eta.render('oss', {
            projects: projects
        })

        return html;
    }),
);

router.post("/oss", defineEventHandler(async (event) => {
    const body = await readBody(event);

    db.prepare("INSERT INTO projects (name, description, github_url) VALUES (?, ?, ?)").run(body.name, body.description, body.github_url);

    return sendRedirect(event, "/oss");
}));

router.get(
    "/vizalo",
    defineEventHandler((event) => {
        logger.info("Hit the vizalo route")

        return "Hello Vizalo! This is app-0!"
    }),
);

createServer(toNodeListener(app)).listen(4000);
