export const request = {
  prefix: 'api',
  middlewares: [
    async (ctx, next: any) => {
      await next();
      const { req } = ctx;
      console.log(req, '---req');
    }
  ]
};