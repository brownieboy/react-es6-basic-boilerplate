/* global __dirname, process, console */
import path from "path";
import webpack from "webpack";
import merge from "webpack-merge";

var TARGET = process.env.npm_lifecycle_event;
const ROOT_PATH = path.resolve(__dirname);
const srcDir = path.join(__dirname, "src");
// const bowerDir = ROOT_PATH + "/bower_components";

console.log("webpack is using webpack.config.babel.js, TARGET = " + TARGET);

if (typeof TARGET === "undefined") {
    TARGET = "build";
}

var exportModule;

const common = {
    // entry: {
    //     app: path.resolve(ROOT_PATH) + "/src/js/app.js"
    // },
    // alias: {
    //     jquery: path.resolve(ROOT_PATH) + "/bower_components/jquery/src/jquery.js"
    // },
    entry: {
        // alltables: path.resolve(ROOT_PATH) + "/src/js/alltables.js",
        // onetomany: path.resolve(ROOT_PATH) + "/src/js/onetomany.js",
        // manytomanylinkage: path.resolve(ROOT_PATH) + "/src/js/manytomanylinkage.js",
        // singleadmintable: path.resolve(ROOT_PATH) + "/src/js/singleadmintable.js",
        // client: ['webpack-dev-server/client?http://localhost:8080'],
        index: path.resolve(ROOT_PATH) + "/src/js/index.js"
        // "index-ui": path.resolve(ROOT_PATH) + "/src/js/index-ui.js"
    },

    resolve: {
        extensions: ["", ".js", "min.js"],
        root: [
            path.resolve(".")
        ]
    },
    module: {
        loaders: [{
            loaders: ["react-hot", "babel-loader"],

            // Skip any files outside of your project"s `src` directory
            include: [
                path.resolve(__dirname, "src/js")
            ],
            // Only run `.js` files through Babel
            test: /\.jsx?$/
        }]
    },
    plugins: [
        // new webpack.ProvidePlugin({
        //     $: "jquery",
        //     jQuery: "jquery",
        //     "window.jQuery": "jquery"
        // })
        // Don"t do this!! It messes up Kendo.  Use it as global via a <script> tag, as per normal
        // and it needs the full version there for some reason, even if you"re actually only
        // loading the minified on in the script tag.
        // Update: this was due to version of jQuery being used, which was 2.2.0.  Stick to 2.1.4.
    ],
    devtool: "source-map"
};

// if (TARGET === "build") {
//     // Sames as build final but without minification/uglification, so big bundle.js
//     exportModule = merge(common, {
//         output: {
//             path: path.resolve(ROOT_PATH, "build/js/"),
//             filename: "[name].js"
//         }
//     });
// }

if (TARGET === "build") {
    // Includes minification, so slow build times and smaller files.  Use for final build to prod only.
    exportModule = merge(common, {
        output: {
            path: path.resolve(ROOT_PATH, "build/js/"),
            filename: "[name].js"
        },

        plugins: [
            new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js", function(module) {
                return module.resource && module.resource.indexOf(srcDir) === -1;
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
    });
}

// Note when inline is set to true, we get an error:
//  Module not found: Error: Cannot resolve "file" or "directory" ./dist/debug.js
// see http://stackoverflow.com/questions/34549508/webpack-dev-server-error-with-hot-module-replacement
const devServerCommon = {
    devServer: {
        colors: true,
        noInfo: false,
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};

const startCommon = merge(common, devServerCommon);

if (TARGET === "start" || !TARGET) {
    exportModule = merge(startCommon, {
        output: {
            filename: "src/[name]bundle.js",
            publicPath: "/"
        }
    });
}

export default exportModule;
