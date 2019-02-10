import * as ReactDOM from 'react-dom';

export function componentAppend(component, element) {
  const div = document.createElement('div');
  ReactDOM.render(component, div);
  while (div.children.length) {
    element.append(div.firstChild);
  }
}

export function componentPrepend(component, element) {
  const div = document.createElement('div');
  ReactDOM.render(component, div);
  while (div.children.length) {
    element.prepend(div.firstChild);
  }
}

export function componentAfter(component, element) {
  const div = document.createElement('div');
  ReactDOM.render(component, div);
  while (div.children.length) {
    element.after(div.firstChild);
  }
}

export function componentBefore(component, element) {
  const div = document.createElement('div');
  ReactDOM.render(component, div);
  while (div.children.length) {
    element.before(div.firstChild);
  }
}
