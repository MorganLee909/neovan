import fs from "node:fs/promises";
import path from "path";

import parseDir from "./parseDir.js";

const srcRoot = path.join(import.meta.dirname, "src");

const main = (options)=> {
    console.time("Build Time");

    fs.mkdir(path.join(import.meta.dirname, ".build"), {recursive: true});
    readFiles(srcRoot);

    console.timeEnd("Build Time");
}

const readFiles = async (dir)=>{
    const files = await fs.readdir(dir, {withFileTypes: true});

    for(let i = 0; i < files.length; i++){
        let curDir = path.join(dir, files[i].name);

        if(files[i].isDirectory()) {
            readFiles(curDir);
        }
    }

    await parseDir(dir);
}

main();
