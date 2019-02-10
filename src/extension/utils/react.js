import * as ReactDOM from 'react-dom';

export function componentAppend(component, element) {
  const div = document.createElement('div');
  ReactDOM.render(component, div);
  div.childNodes.forEach((child) => {
    element.append(child.cloneNode(true));
  });
}

export function componentPrepend(component, element) {
  const div = document.createElement('div');
  ReactDOM.render(component, div);
  div.childNodes.forEach((child) => {
    element.prepend(child.cloneNode(true));
  });
}

export function componentAfter(component, element) {
  const div = document.createElement('div');
  ReactDOM.render(component, div);
  div.childNodes.forEach((child) => {
    element.after(child.cloneNode(true));
  });
}

export function componentBefore(component, element) {
  const div = document.createElement('div');
  ReactDOM.render(component, div);
  div.childNodes.forEach((child) => {
    element.before(child.cloneNode(true));
  });
}
