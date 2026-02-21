import fs from "node:fs/promises";
import path from "path";

const main = (options)=> {
    fs.mkdir(path.join(import.meta.dirname, ".build"), {recursive: true});
    readFiles(path.join(import.meta.dirname, "src"));
}

const readFiles = async (dir)=>{
    const files = await fs.readdir(dir, {withFileTypes: true});

    for(let i = 0; i < files.length; i++){
        let curDir = path.join(dir, files[i].name);

        if(files[i].isDirectory()) {
            readFiles(curDir);
        }
    }

    parse(dir);
}

const parse = async (dir)=>{
    const htmlFile = path.join(dir, "index.html");
    const cssFile = path.join(dir, "index.css");
    const jsFile = path.join(dir, "index.js");

    const [html, css, js] = await Promise.allSettled([
        fs.readFile(htmlFile),
        fs.readFile(cssFile),
        fs.readFile(jsFile)
    ]);
}

main();
