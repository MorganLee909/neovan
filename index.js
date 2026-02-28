import fs from "node:fs/promises";
import {constants} from "node:fs";
import path from "path";
import htmlMinifier from "html-minifier-terser";
import esbuild from "esbuild";

const srcRoot = path.join(import.meta.dirname, "src");

const main = (options)=> {
    fs.mkdir(path.join(import.meta.dirname, ".build"), {recursive: true});
    readFiles(srcRoot);
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

    const buildFiles = [];
    const checkFiles = [
        fs.readFile(htmlFile, "utf-8"), 
        fs.access(cssFile, constants.F_OK),
        fs.access(jsFile, constants.F_OK)
    ];
    let [html, isCss, isJs] = await Promise.allSettled(checkFiles);
    if(html.status !== "fulfilled") return;
    isCss = isCss.status === "fulfilled";
    isJs = isJs.status === "fulfilled";
    if(isCss) buildFiles.push(cssFile);
    if(isJs) buildFiles.push(jsFile);

    html = await htmlMinifier.minify(html.value, {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        decodeEntities: true,
        noNewlinesBeforeTagClose: true,
        removeComments: true
    });

    const esbuildProm = await esbuild.build({
        entryPoints: buildFiles,
        bundle: true,
        minify: true,
        write: false,
        outdir: dir
    });

    if(isCss && isJs){
        html = insert(html, esbuildProm.outputFiles[0].text, "css");
        html = insert(html, esbuildProm.outputFiles[1].text, "js");
    }else if(isCss){
        html = insert(html, esbuildProm.outputFiles[0].text, "css");
    }else if(isJs){
        html = insert(html, esbuildProm.outputFiles[0].text, "js");
    }

    const writeDir = `${dir.replace("/src", "/.build")}`;
    await fs.mkdir(writeDir, {recursive: true});
    fs.writeFile(`${writeDir}/index.html`, html);
}

const insert = (html, insertString, type)=>{
    let locationIndex, openTag, closeTag;
    switch(type){
        case "css":
            locationIndex = html.indexOf("</head>");
            openTag = "<style>"
            closeTag = "</style>"
            break;
        case "js":
            locationIndex = html.indexOf("</body>");
            openTag = "<script>";
            closeTag = "</script>"
            break;
    }
    return `${html.slice(0, locationIndex)}${openTag}${insertString}${closeTag}${html.slice(locationIndex)}`;
}

main();
