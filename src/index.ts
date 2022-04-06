import { IApi } from 'umi';

export default function(api: IApi) {
  if (!api.hasPlugins(['@umijs/plugin-model'])) {
    api.registerPlugins([require.resolve('@umijs/plugin-model')]);
  }
  if (api.hasPlugins(['@umijs/plugin-request'])) {
    api.skipPlugins(['@umijs/plugin-request']);
  }
  if (api.hasPlugins(['@umijs/plugin-qiankun'])) {
    api.skipPlugins(['@umijs/plugin-qiankun']);
  }
  api.registerPlugins([require.resolve('./planet') ,require.resolve('./qiankun')]);
}