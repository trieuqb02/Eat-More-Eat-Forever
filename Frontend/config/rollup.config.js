import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./index.ts",
  output: {
    file: "dist/socketio.bundle.js",
    format: "umd",
    name: "SocketIO",
    sourcemap: true,
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({ tsconfig: "../tsconfig.json" }),
  ],
};