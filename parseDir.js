import fs from "node:fs/promises";
import {constants} from "node:fs";
import path from "path";
import htmlMinifier from "html-minifier-terser";
import esbuild from "esbuild";

export default async (dir)=>{
    const existingFiles = await checkFiles(dir);
    if(!existingFiles.html) return;
    const content = await bundleFiles(existingFiles);
    const html = mergeFiles(content);
    writeHtml(dir, html);
}

const checkFiles = async (dir)=>{
    let htmlPath = path.join(dir, "index.html");
    let cssPath = path.join(dir, "index.css");
    let jsPath = path.join(dir, "index.js");

    let [html, css, js] = await Promise.allSettled([
        fs.access(htmlPath, constants.F_OK),
        fs.access(cssPath, constants.F_OK),
        fs.access(jsPath, constants.f_OK)
    ]);

    if(html.status !== "fulfilled") return {html: null};
    let files = {html: htmlPath};
    if(css.status === "fulfilled") files.css = cssPath;
    if(js.status === "fulfilled") files.js = jsPath;

    return files;
}

const bundleFiles = async (files)=>{
    const entryPoints = [];
    if(files.css) entryPoints.push(files.css);
    if(files.js) entryPoints.push(files.js);

    const esbuildProm = esbuild.build({
        entryPoints: entryPoints,
        bundle: true,
        minify: true,
        write: false,
        outdir: "/"
    });
    const htmlProm = fs.readFile(files.html, "utf-8");

    const data = await Promise.all([esbuildProm, htmlProm]);
    const contents = {
        html: await htmlMinifier.minify(data[1], {
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            conservativeCollapse: false,
            decodeEntities: true,
            noNewlinesBeforeTagClose: true,
            removeComments: true
        }),
        js: "",
        css: ""
    };

    if(files.css && files.js){
        contents.css = `<style>${data[0].outputFiles[0].text}</style>`;
        contents.js = `<script>${data[0].outputFiles[1].text}</script>`;
    }else if(files.css){
        contents.css = `<style>${data[0].outputFiles[0].text}</style>`;
    }else if(files.js){
        contents.js = `<script>${data[0].outputFiles[0].text}</script>`;
    }

    return contents;
}

const mergeFiles = (contents)=>{
    const cssIndex = contents.html.indexOf("</head>");
    let html = `${contents.html.slice(0, cssIndex)}${contents.css}${contents.html.slice(cssIndex)}`;

    const jsIndex = html.indexOf("</body>");
    return `${html.slice(0, jsIndex)}${contents.js}${html.slice(jsIndex)}`;
}

const writeHtml = async (dir, html)=>{
    const writeDir = `${dir.replace("/src", "/.build")}`;
    await fs.mkdir(writeDir, {recursive: true});
    fs.writeFile(`${writeDir}/index.html`, html);
}
