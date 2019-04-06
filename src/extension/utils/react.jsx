import * as ReactDOM from 'react-dom';

export function componentAppend(renderable, element) {
  const div = document.createElement('div');
  ReactDOM.render(renderable, div);
  while (element && div.children.length) {
    element.append(div.firstChild);
  }
}

export function componentPrepend(renderable, element) {
  const div = document.createElement('div');
  ReactDOM.render(renderable, div);
  while (element && div.children.length) {
    element.prepend(div.firstChild);
  }
}

export function componentAfter(renderable, element) {
  const div = document.createElement('div');
  ReactDOM.render(renderable, div);
  while (element && div.children.length) {
    element.after(div.firstChild);
  }
}

export function componentBefore(renderable, element) {
  const div = document.createElement('div');
  ReactDOM.render(renderable, div);
  while (element && div.children.length) {
    element.before(div.firstChild);
  }
}
