import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";

export default {
    input: 'src/index7.ts',
    output: {
        dir: 'dist',
        format: 'esm',
        preferConst: true,
        sourcemap: true,
    },
    plugins: [typescript({sourceMap:true, inlineSources:true}), terser(), serve({contentBase:'dist', port:8080})]
};
