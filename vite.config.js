import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'
import { defineConfig } from 'vite'
import vueJsx from "@vitejs/plugin-vue-jsx"; // 配置vue使用jsx

export default defineConfig({
    define: {
        // 仅替换必要的环境变量
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    plugins: [
        vue(),
        vueJsx(),
        AutoImport({
            imports: [
                'vue',
                {
                    'naive-ui': [
                        'useDialog',
                        'useMessage',
                        'useNotification',
                        'useLoadingBar'
                    ]
                }
            ]
        }),
        Components({
            resolvers: [NaiveUiResolver()],
        }),
    ],
    server: {
        host: '0.0.0.0',
        port: 8080,
        hmr: true,
        usePolling: true,
        // 设置代理
        proxy: {
            '/web': {
                target: 'https://donata.pluscr.com',
                changeOrigin: true,
            },
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            web3: 'web3/dist/web3.min.js',
        },
    },
    css: {
        preprocessorOptions: {
            less: {
                modifyVars: {
                    hack: `true; @import (reference) "${path.resolve('src/layout/index.less')}";`,
                },
                javascriptEnabled: true,
            }
        }
    },
});