import path from 'path';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const { version, name, author } = pkg;

const banner = `/*!
* ${name} v${version}
* (c) ${new Date().getFullYear()} ${author}
*/`;

const resolve = p => {
  return path.resolve(__dirname, p);
}

export default [
  {
    input: resolve('src/limiter.js'),
    plugins: [
      cleanup()
    ],
    output: [
      {
        file: resolve(`dist/limiter.js`),
        format: 'cjs', // commonjs
        sourcemap: true,
        banner,
      },
      {
        file: resolve(`dist/limiter.min.js`),
        format: 'cjs', // commonjs
        sourcemap: true,
        banner,
        plugins: [terser()]
      },
    ]
  }
];
