import * as ReactDOM from 'react-dom/client';

export function componentAppend(renderable, element) {
  if (element != null && !(element instanceof HTMLElement)) {
    console.error('componentAppend must be passed an HTML Element');
    return;
  }

  const div = document.createElement('div');
  ReactDOM.createRoot(div).render(renderable);
  if (element) {
    element.append(div);
  }
}

export function componentPrepend(renderable, element) {
  if (element != null && !(element instanceof HTMLElement)) {
    console.error('componentPrepend must be passed an HTML Element');
    return;
  }

  const div = document.createElement('div');
  ReactDOM.createRoot(div).render(renderable);
  if (element) {
    element.prepend(div);
  }
}

export function componentAfter(renderable, element) {
  if (element != null && !(element instanceof HTMLElement)) {
    console.error('componentAfter must be passed an HTML Element');
    return;
  }

  const div = document.createElement('div');
  ReactDOM.createRoot(div).render(renderable);
  if (element) {
    element.after(div);
  }
}

export function componentBefore(renderable, element) {
  if (element != null && !(element instanceof HTMLElement)) {
    console.error('componentBefore must be passed an HTML Element');
    return;
  }

  const div = document.createElement('div');
  ReactDOM.createRoot(div).render(renderable);
  if (element) {
    element.before(div);
  }
}
