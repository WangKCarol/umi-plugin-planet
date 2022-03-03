import { request } from 'umi';

export async function query() {
  return await request('/apps');
}
