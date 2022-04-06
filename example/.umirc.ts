import { defineConfig } from 'umi';

export default defineConfig({
  presets: [require.resolve('@umijs/preset-ui')],
  plugins: [require.resolve('../lib')],
  routes: [
    {
      path: '/',
      component: '../layouts/index.js',
      routes: [
        {
          path: '/saas-center/#/',
          microApp: 'SaasCenterApp',
        },
        {
          path: '/',
          microApp: 'SaasCenterApp',
        },
      ],
    },
  ],
  qiankun: {
    master: {
      apps: [
        {
          name: 'SaasCenterApp',
          entry: '//localhost:5000/#/',
        },
        {
          xingxingId: '1234556'
        }
      ],
    },
  },
  planet: {
    dataField: 'ppp',
    proxy: {
      development: 'http://localhost:8008/',
      production: 'http://localhost:8009/',
    },
  },
});
