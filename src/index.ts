import { createServer } from "node:http";
import { join } from "node:path"
import { createApp, createRouter, defineEventHandler, toNodeListener } from "h3";
import { Eta } from "eta"
import path from 'path';
import { fileURLToPath } from 'url';


export const app = createApp();

const router = createRouter();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const eta = new Eta({ views: join(__dirname, "templates") })

app.use(router);

// Add a new route that matches GET requests to / path
router.get(
    "/",
    defineEventHandler((event) => {
        const html = eta.render('home', {})

        return html;
    }),
);

router.get(
    "/vizalo",
    defineEventHandler((event) => {
        "Hello Vizalo! This is app-0!"
    }),
);

createServer(toNodeListener(app)).listen(4000);
