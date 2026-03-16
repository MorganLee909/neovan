import fs from "node:fs/promises";
import path from "path";
import {constants} from "node:fs";

import parseComponent from "./parseComponent.js";

export default async (express, options = {})=> {
    console.time("Build Completed In");

    await fs.rm(path.join(process.cwd(), ".build/"), {recursive: true, force: true});
    const app = express();
    const root = path.join(process.cwd(), "routes");
    readFiles(root, root, app);
    app.use(express.static(path.join(process.cwd(), ".build")));

    console.timeEnd("Build Completed In");
    return app;
}

const readFiles = async (dir, root, app)=>{
    const files = await fs.readdir(dir, {withFileTypes: true});

    for(let i = 0; i < files.length; i++){
        let curDir = path.join(dir, files[i].name);

        if(files[i].isDirectory()) {
            readFiles(curDir, root, app);
        }
    }

    let indexFile = await findIndexFile(dir);
    if(!indexFile) return;
    writeBundleFile(dir, await parseComponent(indexFile));
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

const writeBundleFile = async (dir, bundle)=>{
    const writeDir = dir.replace("routes", ".build");
    await fs.mkdir(writeDir, {recursive: true});
    await fs.writeFile(`${writeDir}/index.html`, bundle);
}
