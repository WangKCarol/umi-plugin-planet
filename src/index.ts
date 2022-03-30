import { IApi } from 'umi';
import { join, dirname } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';

export interface RequestOptions {
  dataField?: string;
  proxy?: any;
}

export default function(api: IApi) {
  // 注册乾坤插件
  if (!api.hasPlugins(['@umijs/plugin-model'])) {
    api.registerPlugins([require.resolve('@umijs/plugin-model')]);
  }
  if (api.hasPlugins(['@umijs/plugin-request'])) {
    api.skipPlugins(['@umijs/plugin-request']);
  }
  api.registerPlugins([require.resolve('@umijs/plugin-qiankun')]);
  const {
    paths,
    utils: { winPath },
  } = api;

  api.addRuntimePluginKey(() => 'planet');

  const umiRequestPkgPath = winPath(
    dirname(require.resolve('umi-request/package')),
  );
  const useRequestPkgPath = winPath(
    dirname(require.resolve('@ahooksjs/use-request/package')),
  );

  api.addDepInfo(() => {
    const pkg = require('../package.json');
    return [
      {
        name: 'umi-request',
        range: pkg.dependencies['umi-request'],
        alias: [umiRequestPkgPath],
      },
      {
        name: '@ahooksjs/use-request',
        range: pkg.dependencies['@ahooksjs/use-request'],
        alias: [useRequestPkgPath],
      },
    ];
  });

  // 配置
  api.describe({
    config: {
      schema(joi: any) {
        return joi.object({
          dataField: joi
            .string()
            .pattern(/^[a-zA-Z]*$/)
            .allow(''),
          proxy: joi.object(),
        });
      },
      default: {
        dataField: 'data',
      },
    },
  });

  const requestTemplate = readFileSync(
    winPath(join(__dirname, '../src/request.ts')),
    'utf-8',
  );
  const uiIndexTemplate = readFileSync(
    winPath(join(__dirname, '../src/ui/index.ts')),
    'utf-8',
  );
  const uiNoopTemplate = readFileSync(
    winPath(join(__dirname, '../src/ui/noop.ts')),
    'utf-8',
  );
  const namespace = 'plugin-planet';

  api.chainWebpack((webpackConfig: any) => {
    // decoupling antd ui library
    webpackConfig.resolve.alias.set(
      '@umijs/plugin-request/lib/ui',
      api?.config?.antd === false
        ? winPath(join(api.paths.absTmpPath!, namespace, './ui/noop'))
        : winPath(join(api.paths.absTmpPath!, namespace, './ui/index')),
    );

    return webpackConfig;
  });
  api.addHTMLHeadScripts(() => [
    {
      content: `window.planetConfig=${JSON.stringify(api.config.planet || {})}`,
    },
  ]);
  api.onGenerateFiles(() => {
    const { dataField = 'data' } =
      (api?.config?.planet as RequestOptions) || {};
    try {
      // Write .umi/plugin-request/request.ts
      let formatResultStr;
      let formatRequestUrl = '';
      if (dataField === '') {
        formatResultStr = 'formatResult: result => result';
      } else {
        formatResultStr = `formatResult: result => result?.${dataField}`;
      }
      const env = process.env.NODE_ENV || 'development';
      const { proxy } = api.config.planet || {};
      if (proxy?.[env]) {
        formatRequestUrl = proxy[env];
      }
      api.writeTmpFile({
        path: winPath(join(namespace, 'request.ts')),
        content: requestTemplate
          .replace(/\/\*FRS\*\/(.+)\/\*FRE\*\//, formatResultStr)
          .replace(/\['data'\]/g, dataField ? `['${dataField}']` : '')
          .replace(/data\?: T;/, dataField ? `${dataField}?: T;` : '')
          .replace(/umi-request/g, umiRequestPkgPath)
          .replace(/@ahooksjs\/use-request/g, useRequestPkgPath)
          .replace(
            `import { ApplyPluginsType, history, plugin } from 'umi';`,
            `
import { ApplyPluginsType } from 'umi';
import { history, plugin } from '../core/umiExports';
            `,
          )
          .replace(
            /\/\*REQINTERCEPTORSSTART\*\/(.+)\/\*REQINTERCEPTORSEND\*\//,
            `
          requestMethodInstance.interceptors.request.use((url: any, options: any) => ({url: '${formatRequestUrl}'+url, options}))
          `,
          ), // set proxy
      });
      const uiTmpDir = join(api.paths.absTmpPath!, namespace, 'ui');
      !existsSync(uiTmpDir) && mkdirSync(uiTmpDir, { recursive: true });
      api.writeTmpFile({
        path: winPath(join(namespace, 'ui/index.ts')),
        content: uiIndexTemplate,
      });
      api.writeTmpFile({
        path: winPath(join(namespace, 'ui/noop.ts')),
        content: uiNoopTemplate,
      });
    } catch (e) {
      api.logger.error(e);
    }
  });

  api.addUmiExports(() => {
    return [
      {
        exportAll: true,
        source: `../${namespace}/request`,
      },
    ];
  });
}
