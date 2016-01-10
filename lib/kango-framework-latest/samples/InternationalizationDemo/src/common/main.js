kango.console.log('Application locale = ' + kango.i18n.getApplicationLocale());
kango.console.log('Default locale = ' + kango.getExtensionInfo().default_locale);
kango.console.log('Current locale = ' + kango.i18n.getCurrentLocale());
kango.console.log('Messages = ' + JSON.stringify(kango.i18n.getMessages()));
kango.console.log('Logo message = ' + kango.i18n.getMessage('Logo'));
kango.console.log('Hello message = ' + kango.i18n.getMessage('Hello', {name: 'Bob'}));