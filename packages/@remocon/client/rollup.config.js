import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import fs from 'fs';

const extensions = ['.js', '.ts'];

const pkg = JSON.parse(fs.readFileSync('./package.json'));
const external = Object.keys(pkg.dependencies || {}).concat(['fs/promises', 'mysql2/promise']);

export default process.env.BUILD_TYPE === 'true' ? {
  input: './src/index.ts',
  output: {
    format: 'es',
    file: 'types/index.d.ts',
  },
  external,
  plugins: [
    dts(),
  ]
}: {
  input: './src/index.ts',
  output: {
    format: 'esm',
    file: 'dist/index.js',
    exports: 'named',
    sourcemap: true,
  },
  external,
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    resolve({
      extensions,
    }),
    commonjs(),
    babel({
      exclude: ['node_modules/**', './history/**'],
      babelHelpers: 'bundled',
      extensions,
    }),
    terser(),
  ],
};
