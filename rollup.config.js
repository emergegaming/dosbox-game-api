import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'esm',
        preferConst: true,
    },
    plugins: [typescript(), terser(), serve({contentBase:'dist', port:8080})],
};
