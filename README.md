<img alt="NeoVan logo" src="logo.svg">

# NeoVan

NeoVan is an "anti-framework" meant to offer some of the convenience of modern frameworks without all of their complexity. The aim is to return to writing plain old HTML, CSS and JavaScript without all the in-between code. In reality, Neovan is mostly just a bundling tool, with a few extra features.  

## Introduction

Neovan uses filesystem-based routing. You create your routes (and components) in the 'routes' directory. Any directory that has either an `index.html` or `index.neovan` file will be considered a route. The index file will pull in any components and bundle all of the HTML, CSS, JS into a single file that will be served for the route.

## Getting Started
```js
import express from "express"
import neovan from "neovan"

let options = {
    production: true,
    routesDir: "routes"
};

const app = await neovan(express, options);

app.listen(8000);
```
### File Structure
With NeoVan, any directory with your `routes` directory that has an index file will be considered a route. You can either use `index.html` or `index.neovan`. Either of these files will create a GET route for that directory. You can mix and match these as you pleasewithin your routes so long as each route contains only one index file.

#### index.html
When using and `index.html` file then you can write this just as you would a standard HTML file. For CSS and JavaScript you have two different options. First, you can write your CSS and JavaScript directly in the HTML with style/script tags as you normally would. Also, you can create index.css and/or index.js files. These files will be automatically bundled with the HTML. Also, you are free to use import statements within both JS and CSS and it will bundle those imports together. All import routes are relative. You may mix and match index files and embedded CSS/JavaScript as you please, but I would recommend using one or the other.

#### index.neovan
The recommended option is to use `index.neovan`, since it is simpler for componentization. In this case, you will fit HTML/CSS/JS in a single file. CSS is contained in `<style></style>` and JavaScript is contained in `<script></script>`. Anything not included in one of these two tags will be considered HTML.

```html
<script>
    document.body.querySelector("h1").style.color = "white";
</script>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Example Page</title>
    </head>
    <body>
        <h1>I am an example page</h1>
    </body>
</html>

<style>
    body{
        background: black;
    }
</style>
```

## Components

## Environments

### Production
Production environment is set by passing `production: true` in the options. Alternatively, you can just not pass this property in since it is the default. When in production mode, all routes will be created at build time and maximally minimized for optimization in a production environment.

Depending on the size of your app, this can take some time due to reading through all files. However, once built, there will be no further work needed. When a user visits a route, the full file is already built and ready to serve to them.

### Development
Development environment is set by passing `production: false` in the options. When this is set, the routes will not be bundled at build time, in order to avoid large startup times every single time. Routes will be bundled when they are visited.

## Options
| Property    | Type    | Default | Description                                         |
|-------------|---------|---------|-----------------------------------------------------|
| production  | boolean | true    | Sets environment                                    |
| routesDir   | string  | routes  | Directory for containing code for routes/components |
| buildDir    | string  | .build  | Directory where build files will be stored          |
| assetsDir   | string  | assets  | Directory for serving assets like images            |
| assetsRoute | string  | /assets | Route to serve assets from                          |
