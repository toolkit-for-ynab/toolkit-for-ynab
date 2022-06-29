import { Action } from './apis/action';
import { Runtime } from './apis/runtime';
import { Storage } from './apis/storage';

export class Chrome {
  action = new Action();

  runtime = new Runtime();

  storage = new Storage();
}
