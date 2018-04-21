import { BrowserAction } from './apis/browserAction';
import { Runtime } from './apis/runtime';
import { Storage } from './apis/storage';

export class Chrome {
  browserAction = new BrowserAction();
  runtime = new Runtime();
  storage = new Storage();
}
