import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';

const extensions = ['.js', '.ts'];

const plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
    preventAssignment: true,
  }),
  resolve({
    extensions,
    browser: true,
  }),
  commonjs(),
  typescript({ useTsconfigDeclarationDir: true }),
  babel({
    exclude: ['./history/**'],
    babelHelpers: 'bundled',
    extensions,
  }),
  terser(),
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(filesize({ showMinifiedSize: false, showBrotliSize: true }));
}

export default {
  input: './src/index.ts',
  output: [
    {
      format: 'esm',
      file: 'dist/remocon.esm.js',
      exports: 'named',
      sourcemap: true,
    },
    {
      format: 'umd',
      file: 'dist/remocon.js',
      exports: 'named',
      sourcemap: true,
      name: 'remocon',
    },
    {
      format: 'iife',
      file: 'dist/remocon.bundle.js',
      exports: 'named',
      sourcemap: true,
      name: '__remocon__',
    },
  ],
  plugins,
};
