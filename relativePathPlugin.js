import path from "path";

export default (root)=>({
    name: "force-relative-root",

    setup(build){
        build.onResolve({filter: /^\./}, (args)=>{
            if(!args.path.startsWith(".")) return null;
            const resolvedPath = path.resolve(root, args.path);
            return {
                path: resolvedPath,
                external: false
            };
        })
    }
});
