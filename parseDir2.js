import fs from "node:fs/promises";
import {constants} from "node:fs";
import path from "path";
import htmlMinifier from "html-minifier-terser";
import esbuild from "esbuild";

export default async (dir)=>{
    const indexFile = await findIndex(dir);
    if(!indexFile) return;
    let data = {};
    if(path.extname(indexFile) === ".neovan"){
        data = await getNeovanData(indexFile);
    }else{
        data = await parseHtml(indexFile);
    }
    fs.rm(path.join(dir, "tmp/"), {recursive: true, force: true});
}

const findIndex = async (dir)=>{
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

const getNeovanData = async (index)=>{
    const neovan = await fs.readFile(index, "utf-8");
    const parentPath = path.dirname(index);
    
    const html = neovan.slice(neovan.indexOf("<contents>") + 10, neovan.indexOf("</contents>"));
    const css = neovan.slice(neovan.indexOf("<style>") + 7, neovan.indexOf("</style>"));
    const js = neovan.slice(neovan.indexOf("<script>") + 8, neovan.indexOf("</script>"));

    const cssFile = path.join(parentPath, `tmp/${path.basename(index, ".neovan")}.css`);
    const jsFile = path.join(parentPath, `tmp/${path.basename(index, ".neovan")}.js`);

    await fs.mkdir(path.join(parentPath, "tmp/"));

    await Promise.all([
        css === "" ? null : fs.writeFile(cssFile, css),
        js === "" ? null : fs.writeFile(jsFile, js)
    ]);

    return {
        html: html,
        css: cssFile,
        js: jsFile
    };
}

const parseHtml = async (index)=>{
    const parentPath = path.dirname(index);
    const basename = path.basename(index, ".html");

    return {
        html: await fs.readFile(index, "utf-8"),
        css: path.join(parentPath, `${basename}.css`),
        js: path.join(parentPath, `${basename}.js`)
    };
}
