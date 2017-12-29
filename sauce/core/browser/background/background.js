import { getBrowser } from 'toolkit/core/common/web-extensions';

getBrowser().runtime.onMessage.addListener(handleMessage);

function handleMessage(message, sender, sendResponse) {
  switch (message.type) {
    case 'storage':
      handleStorageMessage(message.content, sendResponse);
      break;
    default:
      console.log('unknown message', message);
  }
}

function handleStorageMessage(request, callback) {
  switch (request.type) {
    case 'keys':
      callback(Object.keys(localStorage));
      break;
    case 'get':
      callback(localStorage.getItem(request.itemName));
      break;
    default:
      console.log('unknown storage request', request);
  }
}
