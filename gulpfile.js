/* global require, __dirname */
// Note: I tried renaming this file to gulpfile.babel.js in order to use
// ES6 syntax here, but it was way too slow in operation.  So we're stuck
// with Node-style CommonJS require statments for now

var gulp = require("gulp");
var runSequence = require("run-sequence");
var path = require("path");
// var domSrc = require("gulp-dom-src");
var del = require("del");
var open = require("open");
var print = require("gulp-print");
var inject = require("gulp-inject");
var htmlreplace = require("gulp-html-replace");
var replace = require("gulp-replace");
var gulpConcat = require("gulp-concat");
var cleanCSS = require("gulp-clean-css");
// var webpack = require("webpack");
// var gutil = require("gulp-util");
// var webpackConfig = require("./webpack.config.babel.js");

var sublimeServerPort = "8082";

var ROOT_PATH = path.resolve(__dirname);
var CURRENT_FOLDER = path.basename(ROOT_PATH);

var PATHS = {
    src: {
        root: "./src",
        css: "./src/css",
        fonts: "./src/fonts",
        jslibsArray: [],
        images: "./src/images"
    },
    build: {
        root: "./build",
        css: "./build/css",
        targetCSSFileName: "reinsurance.css",
        fonts: "./build/fonts",
        js: "./build/js",
        jslibs: "./build/js/libs",
        images: "./build/images"
    },
    buildURL: CURRENT_FOLDER + "/build/index.html",
    doco: CURRENT_FOLDER + "/docs/esdoc/index.html"
};


var htmlFilesArray = ["index"];
var localCSSArray = [];  // These must be in the order that you want them concatenated in the final file
// var localCSSArray = ["site.css", "kendo.overrides.css", "tables.css", "main.css"];

// Copy assets from src to build folder, cleaning that folder out first
gulp.task("cleanBuild", function() {
    return del(PATHS.build.root + "/**/*");
});

gulp.task("copyLocalCSSAndConcat", function() {

    var localCSSRefsArray = localCSSArray.map(function(element) {
        return PATHS.src.css + "/" + element;
    });

    gulp.src(localCSSRefsArray)
        .pipe(gulpConcat(PATHS.build.targetCSSFileName))
        .pipe(print())
        .pipe(cleanCSS())
        .pipe(gulp.dest(PATHS.build.css));
});

// gulp.task("copyFonts", function() {
//     gulp.src(PATHS.src.fonts + '/**/*")
//         .pipe(gulp.dest(PATHS.build.fonts));
// });


gulp.task("copyLocalImages", function() {
    gulp.src(PATHS.src.images + "/**/*")
        .pipe(print())
        .pipe(gulp.dest(PATHS.build.images));
});

gulp.task("copyImages", ["copyLocalImages"]);



// Need to get these out of the /src folder, otherwise doco tools and maybe
// even Webpack will try to operate over them.  We grab the .map files too.
gulp.task("copyJsLibs", function() {
    var libsMapsArray = PATHS.src.jslibsArray.map(function(jsPath) {
        return jsPath.replace(".js", ".map");
    });
    var libsWithMapsArray = PATHS.src.jslibsArray.concat(libsMapsArray);
    for (var x = 0; x < libsWithMapsArray.length; x++) {
        gulp.src(libsWithMapsArray[x])
            .pipe(print())
            .pipe(gulp.dest(PATHS.build.jslibs));
    }
});

gulp.task("copyMisc", function() {
    gulp.src([PATHS.src.root + "/favicon.ico"])
        .pipe(gulp.dest(PATHS.build.root));
});


gulp.task("copyHTMLAndInjectBuildRefs", function() {
    // Copy all the HTML files over and inject the correct JS script tags, consisting of:
    //    * any JS files in the /build/js/libs folder
    //    * the file /build/js/vendor.js
    //    * a page specific JS file, which has the same name as its corresponding value in htmlFilesArray

    var jsRefsArray, jsRefsToInject;
    var jsFixedRefsArray = [PATHS.build.jslibs + "/*.js", PATHS.build.js + "/vendor.js"]; // These libs added to every HTML file.

    var vendorCSSRefsArray = [PATHS.build.css + "/" + PATHS.vendor.targetCSSFileName];
    var localCSSRefsArray = [PATHS.build.css + "/" + PATHS.build.targetCSSFileName];

    var allCSSRefsArray = vendorCSSRefsArray.concat(localCSSRefsArray);

    var cssRefsToInject = gulp.src(allCSSRefsArray, {
        read: false
    });

    // Loop through the list of html files...
    for (var x = 0; x <= htmlFilesArray.length; x++) {
        // Work out which script tags will be injected into this html file
        jsRefsArray = jsFixedRefsArray.concat(PATHS.build.js + "/" + htmlFilesArray[x] + ".js"); // Also add in page specific JS file.

        jsRefsToInject = gulp.src(jsRefsArray, {
            read: false
        });

        gulp.src([PATHS.src.root + "/" + htmlFilesArray[x] + ".html"])
            .pipe(gulp.dest(PATHS.build.root))
            .pipe(htmlreplace()) // Remove dev script tags
            .pipe(inject(jsRefsToInject, { // Inject prod script tags
                name: "injectjs",
                relative: true
            }))
            .pipe(inject(cssRefsToInject, { // Inject prod script tags
                name: "injectcss",
                relative: true
            }))
            .pipe(gulp.dest("./build"));
    }
});


gulp.task("buildAssets", ["copyMisc", "copyImages", "copyHTMLAndInjectBuildRefs"]);

gulp.task("buildAll", function() {
    runSequence("cleanBuild", "copyJsLibs", "webpack", "buildAssets");
});

gulp.task("openBuildSublimeServerIE", function() {
    // gulp.src(__filename)
    // .pipe(open({uri: "http://localhost:' + sublimeServerPort + "/" + PATHS.buildURL}));
    open("http://localhost:" + sublimeServerPort + "/" + PATHS.buildURL, "iexplore");
});

gulp.task("buildAssetsAndOpenBuild", ["buildAssets", "openBuildSublimeServer"]);

gulp.task("openDoco", function() {
    // gulp.src(__filename)
    // .pipe(open({uri: "http://localhost:' + sublimeServerPort + "/" + PATHS.buildURL}));
    open("http://localhost:" + sublimeServerPort + "/" + PATHS.doco);
});



