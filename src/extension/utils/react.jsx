import * as ReactDOM from 'react-dom';

export function componentAppend(renderable, element) {
  if (element != null && !(element instanceof HTMLElement)) {
    console.error('componentAppend must be passed an HTML Element');
    return;
  }

  const div = document.createElement('div');
  ReactDOM.render(renderable, div);
  while (element && div.children.length) {
    element.append(div.firstChild);
  }
}

export function componentPrepend(renderable, element) {
  if (element != null && !(element instanceof HTMLElement)) {
    console.error('componentPrepend must be passed an HTML Element');
    return;
  }

  const div = document.createElement('div');
  ReactDOM.render(renderable, div);
  while (element && div.children.length) {
    element.prepend(div.firstChild);
  }
}

export function componentAfter(renderable, element) {
  if (element != null && !(element instanceof HTMLElement)) {
    console.error('componentAfter must be passed an HTML Element');
    return;
  }

  const div = document.createElement('div');
  ReactDOM.render(renderable, div);
  while (element && div.children.length) {
    element.after(div.firstChild);
  }
}

export function componentBefore(renderable, element) {
  if (element != null && !(element instanceof HTMLElement)) {
    console.error('componentBefore must be passed an HTML Element');
    return;
  }

  const div = document.createElement('div');
  ReactDOM.render(renderable, div);
  while (element && div.children.length) {
    element.before(div.firstChild);
  }
}
