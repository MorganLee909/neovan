import fs from "node:fs/promises";
import path from "path";

import parseDir from "./parseDir.js";

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

    parseDir(dir);
}
