import fs from "node:fs/promises";
import path from "path";
import {constants} from "node:fs";

import parseComponent from "./parseComponent.js";

export default async (express, options)=>{
    let opts = {
        production: true,
        routesDir: "routes",
        assetsDir: "assets",
        assetsRoute: "/assets"
    };
    Object.assign(opts, options)

    let app = express();

    console.time("Build time");

    await fs.rm(path.join(process.cwd(), ".build/"), {recursive: true, force: true});
    let root = path.join(process.cwd(), opts.routesDir);
    await addRoute(root, root, app, opts);
    app.use(assetsRoute, express.static(opts.assetsDir));

    console.timeEnd("Build time");
    return app;
}

const addRoute = async (dir, root, app, opts)=>{
    const files = await fs.readdir(dir, {withFileTypes: true});
    const indexFile = await findIndexFile(dir);
    if(!indexFile) return;

    let route = dir.replace(root, "");
    route = route === "" ? "/" : route;
    if(opts.production){
        const bundle = await parseComponent(indexFile);
        const bundleLocation = dir.replace(opts.routesDir, "build");
        const htmlPath = path.join(bundleLocation, "index.html");
        await fs.mkdir(bundleLocation, {recursive: true});
        await fs.writeFile(htmlPath, bundle);
        app.get(route, async (req, res)=>{res.sendFile(htmlPath)});
    }else{
        app.get(route, async (req, res)=>{res.send(await parseComponent(indexFile))});
    }
    fs.rm(path.join(dir, "tmp/"), {recursive: true, force: true});

    for(let i = 0; i < files.length; i++){
        const curDir = path.join(dir, files[i].name);

        if(files[i].isDirectory()) {
            await addRoute(curDir, root, app, opts);
        }
    }
}

const findIndexFile = async (dir)=>{
    const neovanPath = path.join(dir, "index.neovan");
    const htmlPath = path.join(dir, "index.html");

    const [neovan, html] = await Promise.allSettled([
        fs.access(path.join(dir, "index.neovan"), constants.F_OK),
        fs.access(path.join(dir, "index.html"), constants.F_OK)
    ]);

    if(neovan.status === "fulfilled") return neovanPath;
    if(html.status === "fulfilled") return htmlPath;
    return null;
}
