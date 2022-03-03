import { defineConfig } from 'umi';

export default defineConfig({
  presets: [require.resolve('@umijs/preset-ui')],
  plugins: [require.resolve('../lib')],
  planet: {
    dataField: 'ppp',
    proxy: {
      development: 'http://localhost:8008/',
      prod: 'http://localhost:8008/'
    }
  },
});