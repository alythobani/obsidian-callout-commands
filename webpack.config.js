const path = require("path");

module.exports = {
  entry: "./src/main.ts",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: {
    obsidian: "commonjs2 obsidian",
  },
  output: {
    filename: "main.js",
    path: __dirname,
    libraryTarget: "commonjs",
  },
};
