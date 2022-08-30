/* eslint-disable @typescript-eslint/dot-notation */
let credentials;

credentials['outlookUsername'] = 'dennis.clausen@juchu.de';
credentials['outlookPassword'] = 'test';
/* let outlookUsername = '';
let outlookPassword = '';
let moodleUsername = '';
let moodlePassword = '';
let untisUsername = '';
let untisPassword = '';
let bbbUsername = '';
let bbbPassword = '';


// get Credentials from local Storage
// Outlook
if (localStorage.getItem('outlookUsername') !== null) {
  credentials['outlookUsername'] = localStorage.getItem('outlookUsername');
}
if (localStorage.getItem('outlookPassword') !== null) {
  credentials['outlookPassword'] = localStorage.getItem('outlookPassword');
}
// Moodle
if (localStorage.getItem('moodleUsername') !== null) {
  credentials['moodleUsername'] = localStorage.getItem('moodleUsername');
}
if (localStorage.getItem('moodlePassword') !== null) {
  credentials['moodlePassword'] = localStorage.getItem('moodlePassword');
}
// UNTIS
if (localStorage.getItem('untisUsername') !== null) {
  credentials['untisUsername'] = localStorage.getItem('untisUsername');
}
if (localStorage.getItem('untisUsername') !== null) {
  credentials['untisUsername'] = localStorage.getItem('untisUsername');
}


`document.querySelector('#userNameInput').value = ${credentials['outlookUsername']};
       document.querySelector('#passwordInput').value = ${credentials['outlookPassword']}`
*/

document.querySelectorAll('webview').forEach((wv) => {
  wv.addEventListener('did-finish-load', (event) => {
    if (wv.id === 'wv-Outlook') {
      wv.executeJavaScript(
        "document.querySelector('#userNameInput').value = 'dennis.clausen@bbz-rd-eck.de'"
      );
      wv.executeJavaScript(
        "document.querySelector('#passwordInput').value = 'sqR2049!'"
      );
    }
    if (wv.id === 'wv-BBZPortal') {
      wv.executeJavaScript(
        `document.querySelector('#username').value = 'claud'`
      );
      wv.executeJavaScript(
        `document.querySelector('#password').value = 'claud'`
      );
    }
  });
});

/*
document.addEventListener('DOMContentLoaded', (event) => {
  const script = document.createElement('script');
  script.src = 'https://code.jquery.com/jquery-3.6.1.min.js';
  // eslint-disable-next-line no-multi-assign
  script.onload = script.onreadystatechange = () => {
    document.querySelector('#userNameInput').value =
      'dennis.clausen@bbz-rd-eck.de';
  };
  document.body.appendChild(script);
});
// */

// document.querySelectorAll('webview').forEach((wv) => {if (wv.id == 'wv-Outlook') {const wvo = wv; console.log(wvo)}})
