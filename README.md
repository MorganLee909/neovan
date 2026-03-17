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
## Environments

### Production
Production environment is set by passing `production: true` in the options. Alternatively, you can just not pass this property in since it is the default. When in production mode, all routes will be created at build time and maximally minimized for optimization in a production environment.

Depending on the size of your app, this can take some time due to reading through all files. However, once built, there will be no further work needed. When a user visits a route, the full file is already built and ready to serve to them.

### Development
Development environment is set by passing `production: false` in the options. When this is set, the routes will not be bundled at build time, in order to avoid large startup times every single time. Routes will be bundled when they are visited.

## Options
| Property   | Type    | Default | Description                                         |
|------------|---------|---------|-----------------------------------------------------|
| production | boolean | true    | Sets environment                                    |
| routesDir  | string  | routes  | Directory for containing code for routes/components |
| buildDir   | string  | .build  | Directory where build files will be stored          |
