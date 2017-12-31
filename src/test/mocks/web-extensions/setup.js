import { Chrome } from './chrome';

global.chrome = new Chrome();

beforeEach(() => {
  global.chrome = new Chrome();
});
