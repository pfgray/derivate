const { ioTsTransformer } = require("@derivate/io-ts-deriver/lib/io-ts-transformer");
const path = require('path')

// tslint:disable-next-line no-var-requires

module.exports = {
  entry: "./index.ts",
  mode: "development",
  output: {
    filename: "output.js",
  },
  optimization: {
    minimize: false
  },
  devtool: '#source-map',
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: path.resolve(__dirname, './echo-loader.js'),
            options: {
              label: '* After babel-loader *'
            }
          },
          {
            loader: "babel-loader"
          },
          {
            loader: path.resolve(__dirname, './echo-loader.js'),
            options: {
              label: '* After ts-loader *'
            }
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              compilerOptions: {
                noEmit: false,
                declaration: false
              },
              getCustomTransformers: (program) => {

                // addDep("io-ts")
                return {
                  before: [ioTsTransformer(program)]
                };
              }
            }
          },
          {
            loader: path.resolve(__dirname, './echo-loader.js'),
            options: {
              label: '* Raw file *'
            }
          },
        ]
      }
    ]
  },
  plugins: []
};
