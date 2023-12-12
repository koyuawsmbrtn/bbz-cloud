/* eslint-disable react/jsx-filename-extension */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable vars-on-top */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-var */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable func-names */

import React from 'react';
import $ from 'jquery';
import smalltalk from 'smalltalk';
import monkey from '../../assets/monkey.png';
import u1 from '../../assets/uebersicht.png';
import u2 from '../../assets/doge.png';
import sb from '../../assets/settings.png';
import db from '../../assets/dropdown.png';
import links from '../../assets/primary_apps.json';
import links2 from '../../assets/secondary_apps.json';
import logo from '../../assets/logo.png';
import version from '../../package.json';
import isTeacherVar from '../../assets/isTeacher.json';

// global (to renderer) variables
const versionApp = version.version;
let zoomFaktor = 0.8;
let progressValue = 'value=100';

// PW- and username variables
const defaultCreds = {
  outlookUsername: '',
  outlookPassword: '',
  moodleUsername: '',
  moodlePassword: '',
  bbbUsername: '',
  bbbPassword: '',
};
let creds = defaultCreds;

// allow to recognize state for already injected creds - to prevent continous reloading of WebApps
const credsAreSet = {
  outlook: false,
  moodle: false,
  bbb: false,
  handbuch: false,
};

if (
  localStorage.getItem('zoomFaktor') !== null &&
  parseFloat(localStorage.getItem('zoomFaktor')) > 0
) {
  zoomFaktor = parseFloat(localStorage.getItem('zoomFaktor'));
}

window.api.send('zoom', zoomFaktor);

// starting image - dependend on, which version is compiled
let titleImage;
const isTeacher = isTeacherVar.value;
if (isTeacher) {
  titleImage = u1;
} else {
  titleImage = u2;
}

// Hierin werden die Credentials des Users aus dem Keyring des jeweiligen System geholt
// Ein Sammelobjekt wird übertragen statt einzelner ipc-Anfragen
window.api.receive('getPassword', (result) => {
  creds = result;
});
window.api.send('getPassword');

// Relaod selected apps on command from the main process
window.api.receive('reloadApp', (result) => {
  document.querySelectorAll('webview').forEach((wv) => {
    wv.addEventListener('did-finish-load', async (event) => {
      wv.reloadIgnoringCache();
      // Autofill Outlook
      if (wv.id === 'wv-Outlook' && credsAreSet.outlook === false) {
        credsAreSet.outlook = true;
        wv.executeJavaScript(
          `document.querySelector('#userNameInput').value = "${creds.outlookUsername}"; void(0);`
        );
        wv.executeJavaScript(
          `document.querySelector('#passwordInput').value = "${creds.outlookPassword}"; void(0);`
        );
        wv.executeJavaScript(
          // Hier wird der Button geklickt
          `document.querySelector('#submitButton').click();`
        );
      }
      // Autofill Handbuch
      if (wv.id === 'wv-BBZHandbuch' && credsAreSet.handbuch === false) {
        credsAreSet.handbuch = true;
        wv.executeJavaScript(
          `document.querySelector('#userNameInput').value = "${creds.outlookUsername}"; void(0);`
        );
        wv.executeJavaScript(
          `document.querySelector('#passwordInput').value = "${creds.outlookPassword}"; void(0);`
        );
        wv.executeJavaScript(
          // Hier wird der Button geklickt
          `document.querySelector('#submitButton').click();`
        );
        await sleep(5000);
        wv.reload();
      }
      // Autofill Moodle
      if (wv.id === 'wv-Moodle' && credsAreSet.moodle === false) {
        credsAreSet.moodle = true;

        wv.executeJavaScript(
          `document.querySelector('#username').value = "${creds.moodleUsername}"; void(0);`
        );
        wv.executeJavaScript(
          `document.querySelector('#password').value = "${creds.moodlePassword}"; void(0);`
        );
        wv.executeJavaScript(
          // Hier wird der Button geklickt
          `document.querySelector('#loginbtn').click();`
        );
      }
      // Autofill BigBlueButton
      if (wv.id === 'wv-BigBlueButton' && credsAreSet.bbb === false) {
        credsAreSet.bbb = true;
        wv.executeJavaScript(
          `document.querySelector('#session_email').value = "${creds.bbbUsername}"; void(0);`
        );
        wv.executeJavaScript(
          `document.querySelector('#session_password').value = "${creds.bbbPassword}"; void(0);`
        );
        wv.executeJavaScript(
          // Hier wird der Button geklickt
          `document.getElementsByClassName('signin-button')[0].click();`
        );
      }
    });
  });
});

// window.location.reload();

// Download progress bar
window.api.receive('download', (result) => {
  if (
    result === 'completed' ||
    result === 'interrupted' ||
    result === 'paused' ||
    result === 'failed' ||
    result === 100
  ) {
    $('#download').hide();
    $('#download_label').hide();
  }
  if (result === 'noPercent') {
    progressValue = ''; // disable the value option for progressbar to get a not-progressing bar - when no total data amount is known
    $('#download').show();
    $('#download_label').show();
    progressValue = 'value=100'; // reenable standard value - just in case
  }
  if (typeof result === 'number') {
    $('#download').show();
    $('#download_label').show();
    $('#download').attr('value', result);
  }
});

window.api.receive('update', (result) => {
  if (result === 'available') {
    $('#updateButton').show();
  }
});

window.api.receive('changeUrl', (result) => {
  if (result === 'settings') {
    $('#settings').show();
    $('#content').hide();
    $('#buttons').css('visibility', 'hidden');
    $('body').css('overflow', 'overlay');
  } else {
    changeUrl(result, '');
  }
});

function resetCredsAreSet() {
  credsAreSet.bbb = false;
  credsAreSet.moodle = false;
  credsAreSet.outlook = false;
  credsAreSet.handbuch = false;
}

function reloadPage() {
  resetCredsAreSet();
  window.location.reload();
}

function saveSettings() {
  // Save Autostart Settings
  const autostart = document.querySelector('input');
  autostart.addEventListener(
    'click',
    window.api.send('autostart', autostart?.checked)
  );
  if (autostart?.checked) {
    localStorage.setItem('autostart', 'true');
  } else {
    localStorage.setItem('autostart', 'false');
  }
  // Save credentials
  creds = {
    outlookUsername: document.getElementById('emailAdress').value,
    outlookPassword: document.getElementById('outlookPW').value,
    moodleUsername: document
      .getElementById('teacherID')
      .value.toString()
      .toLowerCase(),
    moodlePassword: document.getElementById('moodlePW').value,
    bbbUsername: document.getElementById('emailAdress').value,
    bbbPassword: document.getElementById('bbbPW').value,
  };
  window.api.send('savePassword', creds);

  // reload App
  resetCredsAreSet();
  window.location.reload();
}

function clickable(b: boolean) {
  localStorage.setItem('isClickable', String(b));
}

export default class Main extends React.Component {
  async componentDidMount() {
    localStorage.setItem('isClickable', 'true');
    $('#main').hide();
    $('#error').hide();
    $('#settings').hide();
    $('#download').hide();
    $('#download_label').hide();
    $('#updateButton').hide();
    $('#dropdownb').click(function () {
      if ($('#dropdownMenu').is(':visible')) {
        $('#dropdownMenu').hide();
        return;
      }
      const buttonRect = document
        .getElementById('dropdownb')
        .getBoundingClientRect();
      $('#dropdownMenu').css('top', `${buttonRect.bottom}px`);
      $('#dropdownMenu').css('left', `${buttonRect.left - 200}px`); // 100px is the width of the dropdown menu
      $('#dropdownMenu').css('width', '250px');
      $('#dropdownMenu').show();
    });
    $('#settingsb').click(function () {
      $('#settings').show();
      $('#content').hide();
      $('#buttons').css('visibility', 'hidden');
      $('body').css('overflow', 'overlay');
    });
    $('.clickable-modifier input').click(function () {
      clickable(false);
    });
    $('body').css('background', '#173a64');
    // let isOnline = true;
    // eslint-disable-next-line promise/catch-or-return
    fetch(`https://mastodon.social/api/v1/instance?d=${Date.now()}`)
      .then((response) => {
        // eslint-disable-next-line promise/always-return
        if (!response.ok) {
          // isOnline = false;
        }
      })
      .catch(() => {
        $('#loading').hide();
        $('#error').show();
        window.setInterval(() => {
          $('#main').hide();
          $('body').css('background', '#173a64');
        });
      });
    window.setTimeout(function () {
      try {
        $.get(
          'https://api.openweathermap.org/data/2.5/weather?q=Rendsburg&units=metric&appid=735f03336131c3e5700d4e07662d570c',
          function (data: { main: { temp: number } }) {
            $('#temperature').html(String(Math.round(data.main.temp)));
          }
        );
      } catch (e) {
        console.log(e);
      }
    });

    function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    function showMotd() {
      $.get(
        `https://koyuawsmbrtn.github.io/bbz-cloud/hosted/motd.html?${Date.now()}`,
        (data) => {
          if (data !== localStorage.getItem('motd')) {
            localStorage.setItem('motd', data);
            smalltalk.alert('Systemnachricht', data);
          }
        }
      );
    }

    showMotd();

    window.setInterval(showMotd, 3000);

    window.setTimeout(() => {
      $('#loading').hide();
      $('#dropdownMenu').hide();
      $('#main').show();
      $('body').css('background', `#fff`);

      window.setInterval(() => {
        if (!isTeacher) {
          $('.teacher').hide();
        }
      });
      for (const [key, e] of Object.entries(links)) {
        if (e.teacher === true && isTeacher === true) {
          if (key !== 'Issues') {
            $('#appchecks').append(
              `<p id="checkbox-${key}"><input type="checkbox" id="check-${key}" onClick="toggleApp('${key}')" /> ${key}</p>`
            );
          }
          if (localStorage.getItem(`checked-${key}`) === null) {
            if (e.enabled) {
              localStorage.setItem(`checked-${key}`, 'true');
            } else {
              localStorage.setItem(`checked-${key}`, 'false');
            }
          }
          if (localStorage.getItem(`checked-${key}`) === 'true') {
            $(`#check-${key}`).attr('checked', '');
          }
          $('#apps').append(
            `<button onClick="changeUrl('${key}', '${e.url}')" class="link-${key} app"><img src="${e.icon}" title=${key} />${key}</button>`
          );
          if (localStorage.getItem(`checked-${key}`) === 'false') {
            $(`.link-${key}`).hide();
          }
          $('#views').append(
            `<webview
                id="wv-${key}"
                class="wv web-${key}"
                src="${e.url}"
                style="display:inline-flex; width:100%;"
                allowpopups></webview>`
          );
        }
        if (e.teacher === false) {
          if (key !== 'Issues') {
            $('#appchecks').append(
              `<p><input type="checkbox" id="check-${key}" onClick="toggleApp('${key}')" /> ${key}</p>`
            );
          }
          if (localStorage.getItem(`checked-${key}`) === null) {
            if (e.enabled) {
              localStorage.setItem(`checked-${key}`, 'true');
            } else {
              localStorage.setItem(`checked-${key}`, 'false');
            }
          }
          if (localStorage.getItem(`checked-${key}`) === 'true') {
            $(`#check-${key}`).attr('checked', '');
          }
          $('#apps').append(
            `<button onClick="changeUrl('${key}', '${e.url}')" class="link-${key} app"><img src="${e.icon}" title=${key} />${key}</button>`
          );
          if (localStorage.getItem(`checked-${key}`) === 'false') {
            $(`.link-${key}`).hide();
          }
          $('#views').append(
            `<webview
                id="wv-${key}"
                class="wv web-${key}"
                src="${e.url}"
                style="display:inline-flex; width:100%;"
                allowpopups></webview>`
          );
        }

        // Add Buttons for Navigation
        $('#buttons').append(
          `<span onClick="reloadView('${key}')" class="wvbr webbr-${key}" style="cursor:pointer;"><img height="20" style="vertical-align:middle;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNDg5LjUzMyA0ODkuNTMzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuNTMzIDQ4OS41MzM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMjY4LjE3NSw0ODguMTYxYzk4LjItMTEsMTc2LjktODkuNSwxODguMS0xODcuN2MxNC43LTEyOC40LTg1LjEtMjM3LjctMjEwLjItMjM5LjF2LTU3LjZjMC0zLjItNC00LjktNi43LTIuOQoJCWwtMTE4LjYsODcuMWMtMiwxLjUtMiw0LjQsMCw1LjlsMTE4LjYsODcuMWMyLjcsMiw2LjcsMC4yLDYuNy0yLjl2LTU3LjVjODcuOSwxLjQsMTU4LjMsNzYuMiwxNTIuMywxNjUuNgoJCWMtNS4xLDc2LjktNjcuOCwxMzkuMy0xNDQuNywxNDQuMmMtODEuNSw1LjItMTUwLjgtNTMtMTYzLjItMTMwYy0yLjMtMTQuMy0xNC44LTI0LjctMjkuMi0yNC43Yy0xNy45LDAtMzEuOSwxNS45LTI5LjEsMzMuNgoJCUM0OS41NzUsNDE4Ljk2MSwxNTAuODc1LDUwMS4yNjEsMjY4LjE3NSw0ODguMTYxeiIgc3R5bGU9ImZpbGw6I2ZmZjsiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"></span>`
        );
        $('#buttons').append(
          `<span onClick="back('${key}')" class="wvbb webbb-${key}" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:10px;">&larr;</span>`
        );
        $('#buttons').append(
          `<span onClick="forward('${key}')" class="wvbf webbf-${key}" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:10px;">&rarr;</span>`
        );
        $('#buttons').append(
          `<span onClick="copyUrl('${key}')" class="wvbc webbc-${key}" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:10px;"><i class="fa fa-files-o" aria-hidden="true"></i></span>`
        );
      }
      $('#buttons').append(
        `<span onClick="changeUrl('Issues', 'https://bbz-cloud-issues.netlify.app')" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:16px;">!</span>`
      );

      // Add Dropdown Menu
      $('#dropdownMenu').append(`<ul id="dropdownListe">`);
      for (const [key, appLink] of Object.entries(links2)) {
        $('#dropdownMenu').append(
          `<li id="${appLink.url}" class="dropdownApp" style="display:flex;">
              <a onClick="openInNewWindow('${appLink.url}')" target="_blank" class="link-${key} app" style="color: black; cursor:pointer;">
                <img src="${appLink.icon}" height="20" title="${key}" />
                <b>${key}</b>
              </a>
             </li>`
        );
      }
      $('#dropdownMenu').append(`<hr>`);
      const entries = JSON.parse(localStorage.getItem('entries'));
      if (entries && Array.isArray(entries)) {
        entries.forEach((entry) => {
          $('#dropdownMenu').append(
            `<li id="${entry.name}" class="customApp" style="display:flex;">
                <a onClick="openInNewWindow('${entry.url}');" style="color:black; cursor:pointer;" target="_blank">
                  <img style="display: inline; height: 1rem; margin-right:4px;" src="https://s2.googleusercontent.com/s2/favicons?domain_url=${entry.url}" />
                  <i>${entry.name}</i>
                </a>
                <button id="deleteButton-${entry.name}" style="margin-left:2px; color:red; font-weight:bold; background-color:transparent;">
                -
                </button>
              </li>`
          );
          $(`#deleteButton-${entry.name}`).click(() => {
            // eslint-disable-next-line no-alert
            const confirmDelete = confirm(
              `Soll der Eintrag ${entry.name} wirklich gelöscht werden?`
            );
            if (confirmDelete) {
              $(`#${entry.name}`).hide();
              // Code to delete the entry from localStorage
              const entries = JSON.parse(localStorage.getItem('entries'));
              const updatedEntries = entries.filter(
                (e) => e.name !== entry.name
              );
              localStorage.setItem('entries', JSON.stringify(updatedEntries));
              if (updatedEntries.length === 0) {
                localStorage.removeItem('entries');
              }
            }
          });
        });
      }
      $('#dropdownMenu').append(`
      <li id="addEntryLI">
        <button
          id="addEntryBtn"
          style="display:block; padding-left:4px; padding-right:4px; padding-top:2px; padding-bottom:2px;"
        >
          +
        </button>
      </li>`);
      $('#dropdownMenu').append(`</ul>`);

      $('#modalAddEntry').append(`
        <div class="modal" />
          <h2 style="font-weight: 700;">Eintrag hinzufügen</h2>
          <input
              type="text"
              id="nameInput"
              placeholder="Name"
            />
          <input
            type="text"
            id="urlInput"
            placeholder="URL"
          />
          <button
            id="saveEntryBtn"
          >
            Speichern
          </button>
          <button
            id="cancelBtn"
          >
            Abbrechen
          </button>
         </div> `);
      $('#modalAddEntry').hide();

      $('#addEntryBtn').click(() => {
        $('#modalAddEntry').show();
      });
      $('#cancelBtn').click(() => {
        $('#nameInput').val('');
        $('#urlInput').val('');
        $('#modalAddEntry').hide();
      });

      // Save entry to localStorage when save button is clicked
      $('#saveEntryBtn').click(() => {
        const name = $('#nameInput').val();
        let url = $('#urlInput').val();
        if (name && url) {
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
          }
          const entry = { name, url };
          const entries = JSON.parse(localStorage.getItem('entries')) || [];
          entries.push(entry);
          localStorage.setItem('entries', JSON.stringify(entries));
          $('#nameInput').val('');
          $('#urlInput').val('');
          $('#modalAddEntry').hide();
        }
        // Readd all entries to dropdown menu - standard  ones and from localStorage
        $('#dropdownMenu').empty();
        $('#dropdownMenu').append(`<ul id="dropdownListe">`);
        for (const [key, appLink] of Object.entries(links2)) {
          $('#dropdownMenu').append(
            `<li id="${appLink.url}" class="dropdownApp" style="display:flex;">
              <a onClick="openInNewWindow('${appLink.url}')" target="_blank" class="link-${key} app" style="color: black; cursor:pointer;">
                <img src="${appLink.icon}" height="20" title="${key}" />
                <b>${key}</b>
              </a>
             </li>`
          );
        }
        $('#dropdownMenu').append(`<hr />`);
        const entries = JSON.parse(localStorage.getItem('entries'));
        if (entries && Array.isArray(entries)) {
          entries.forEach((entry) => {
            $('#dropdownMenu').append(
              `<li id="${entry.name}" class="customApp" style="display:flex;">
                  <a onClick="openInNewWindow('${entry.url}');" style="color: black; cursor:pointer;" target="_blank">
                    <img style="display: inline; height: 1rem; margin-right:4px;" src="https://s2.googleusercontent.com/s2/favicons?domain_url=${entry.url}" />
                    <i>${entry.name}</i>
                  </a>
                  <button id="deleteButton-${entry.name}" style="margin-left:2px; color:red; font-weight:bold; background-color:transparent;">
                  -
                  </button>
                </li>`
            );
            $(`#deleteButton-${entry.name}`).click(() => {
              // eslint-disable-next-line no-alert
              const confirmDelete = confirm(
                `Soll der Eintrag ${entry.name} wirklich gelöscht werden?`
              );
              if (confirmDelete) {
                $(`#${entry.name}`).hide();
                // Code to delete the entry from localStorage
                const entries = JSON.parse(localStorage.getItem('entries'));
                const updatedEntries = entries.filter(
                  (e) => e.name !== entry.name
                );
                localStorage.setItem('entries', JSON.stringify(updatedEntries));
                if (updatedEntries.length === 0) {
                  localStorage.removeItem('entries');
                }
              }
            });
          });
        }
        $('#dropdownMenu').append(`<li id="addEntryLI">
          <button
            id="addEntryBtn"
            style="display:block; padding-left:4px; padding-right:4px; padding-top:2px; border:none; padding-bottom:2px;"
          >
            +
          </button>
        </li>`);
        $('#dropdownMenu').append(`</ul>`);
        $('#addEntryBtn').click(() => {
          $('#modalAddEntry').show();
        });

        // Close modal when cancel button is clicked
        $('#cancelBtn').click(() => {
          $('#nameInput').val('');
          $('#urlInput').val('');
          $('#modalAddEntry').hide();
        });
      });

      if (localStorage.getItem('autostart') === 'true') {
        $('#autostart').attr('checked', 'true');
      }

      // Credentials in die einzelnen WebViews einfügen
      document.querySelectorAll('webview').forEach((wv) => {
        wv.addEventListener('did-finish-load', async (event) => {
          // Autofill Outlook
          if (wv.id === 'wv-Outlook' && credsAreSet.outlook === false) {
            credsAreSet.outlook = true;
            wv.executeJavaScript(
              `document.querySelector('#userNameInput').value = "${creds.outlookUsername}"; void(0);`
            );
            wv.executeJavaScript(
              `document.querySelector('#passwordInput').value = "${creds.outlookPassword}"; void(0);`
            );
            wv.executeJavaScript(
              // Hier wird der Button geklickt
              `document.querySelector('#submitButton').click();`
            );
          }
          // Autofill Handbuch
          if (wv.id === 'wv-BBZHandbuch' && credsAreSet.handbuch === false) {
            credsAreSet.handbuch = true;
            wv.executeJavaScript(
              `document.querySelector('#userNameInput').value = "${creds.outlookUsername}"; void(0);`
            );
            wv.executeJavaScript(
              `document.querySelector('#passwordInput').value = "${creds.outlookPassword}"; void(0);`
            );
            wv.executeJavaScript(
              // Hier wird der Button geklickt
              `document.querySelector('#submitButton').click();`
            );
            await sleep(5000);
            wv.reload();
          }
          // Autofill Moodle
          if (wv.id === 'wv-Moodle' && credsAreSet.moodle === false) {
            credsAreSet.moodle = true;

            wv.executeJavaScript(
              `document.querySelector('#username').value = "${creds.moodleUsername}"; void(0);`
            );
            wv.executeJavaScript(
              `document.querySelector('#password').value = "${creds.moodlePassword}"; void(0);`
            );
            wv.executeJavaScript(
              // Hier wird der Button geklickt
              `document.querySelector('#loginbtn').click();`
            );
          }
          // Autofill BigBlueButton
          if (wv.id === 'wv-BigBlueButton' && credsAreSet.bbb === false) {
            credsAreSet.bbb = true;
            wv.executeJavaScript(
              `document.querySelector('#session_email').value = "${creds.bbbUsername}"; void(0);`
            );
            wv.executeJavaScript(
              `document.querySelector('#session_password').value = "${creds.bbbPassword}"; void(0);`
            );
            wv.executeJavaScript(
              // Hier wird der Button geklickt
              `document.getElementsByClassName('signin-button')[0].click();`
            );
          }
        });
      });
      $('.wv').hide();
      $('.wvbr').hide();
      $('.wvbb').hide();
      $('.wvbf').hide();
      $('.wvbc').hide();
    }, 2000);

    $('#updateButton').click(() => {
      $('#updateButton').html('Installiere...');
      window.api.send('runUpdate');
    });

    const debugMenu = `
    <button onClick="showUpdate()">Fake update</button>\n
    <button onClick="fakeDownload()">Fake download</button>\n
    <button onClick="location.reload()">Reload</button>\n
    <button onClick="deleteAndReload()">Delete config &amp; Reload</button>\n
    <button onClick="devtools()">Open dev tools</button>\n
    `;

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.keyCode === 32) {
        // Easter Egg ;)
        $('#titleImage').html(
          '<video src="https://f001.backblazeb2.com/file/koyuspace-media/pleroma/8f9f1c1f-6199-4a54-bf42-36252e66c353/rickroll.mp4" width="640" height="480" autoplay loop></video>'
        );
      } else if (event.ctrlKey && event.keyCode === 187) {
        // Strg + +
        zoomFaktor += 0.1; // Zoom in um 10%
        if (zoomFaktor > 5.0) {
          zoomFaktor = 5.0;
        }
      } else if (event.ctrlKey && event.keyCode === 189) {
        // Strg + -
        zoomFaktor -= 0.1; // Zoom in um 10%
        if (zoomFaktor < 0.2) {
          zoomFaktor = 0.2;
        }
      } else if (event.ctrlKey && event.altKey && event.keyCode === 68) {
        // Strg + Alt * D
        smalltalk.alert('Super secret debug menu', debugMenu);
      } else if (event.ctrlKey && event.shiftKey && event.keyCode === 76) {
        // Strg + Shift + L
        window.api.send('bitwarden');
      }
      localStorage.setItem('zoomFaktor', zoomFaktor.toString());
      window.api.send('zoom', zoomFaktor);
    });
  }

  render() {
    return (
      <div>
        <div id="main">
          <header>
            <div id="container">
              <div id="headnote">
                <p>
                  <img src={logo} alt="BBZ Logo" height="28" id="logo" />
                  <h1>BBZ Cloud</h1>
                </p>
                <label htmlFor="download" id="download_label">
                  Download:{' '}
                </label>
                <progress id="download" {...progressValue} max="100" />
                <p>
                  Aktuell sind es <span id="temperature" />
                  °C
                </p>
              </div>
              <div id="apps" />
              <img
                id="dropdownb"
                src={db}
                alt="Weitere Apps"
                // className="debug"
                height="20"
              />
              <div id="dropdownMenu" />
              <img
                id="settingsb"
                src={sb}
                alt="Einstellungen"
                // className="debug"
                height="20"
              />
              <div id="buttons" />
              <div style={{ float: 'right', marginRight: '20px' }}>
                <button id="updateButton">Update verfügbar</button>
              </div>
              <br />
            </div>
          </header>
          <div id="content">
            <div id="views" />
            <div id="titleImage">
              <img
                style={{ marginLeft: '10px', marginTop: '15px' }}
                height="560"
                src={titleImage}
                alt="Übersicht"
              />
            </div>
          </div>
          <div id="modalAddEntry" />
          <div id="settings">
            <div id="settingsv">
              <h1>Einstellungen</h1>
              <p className="error">
                <i className="fa fa-lightbulb-o" aria-hidden="true" /> Nicht
                vergessen zu speichern!
              </p>
              <h2>Autostart</h2>
              <div className="clickable-modifier">
                <input type="checkbox" id="autostart" name="autostart_onoff" />
                <label htmlFor="autostart_onoff">
                  App beim Login am Computer automatisch starten
                </label>
                <h2>Apps aktivieren/deaktivieren</h2>
              </div>
              <div className="clickable-modifier">
                <div id="appchecks" className="twoColumn" />
                <label htmlFor="icon_website">Icon der Website</label>
                <h2>Anmeldedaten speichern</h2>
                <div className="teacher">
                  <h3>E-Mail-Adresse (für Outlook und BigBlueButton)</h3>
                  <div id="views" className="twoColumn">
                    <input
                      type="text"
                      id="emailAdress"
                      size="50"
                      name="emailAdress"
                      placeholder="vorname.nachname@bbz-rd-eck.de"
                      defaultValue=""
                    />
                    <label htmlFor="emailAdress">E-Mail-Adresse</label>
                    <p />
                  </div>
                </div>
                <h3>Moodle-Nutzername</h3>
                <input
                  type="text"
                  id="teacherID"
                  size="50"
                  name="teacherID"
                  defaultValue=""
                />
                <label htmlFor="teacherID">
                  {isTeacher ? 'Lehrerkürzel' : 'Benutzername'}
                </label>
                <p />
                <h3>Passworte</h3>
                <div className="teacher">
                  <input
                    type="password"
                    id="outlookPW"
                    size="30"
                    name="outlookPW"
                    defaultValue=""
                  />
                  <label htmlFor="outlookPW">Outlook</label>
                  <p />
                  <input
                    type="password"
                    id="bbbPW"
                    size="30"
                    name="bbbPW"
                    placeholder=""
                    defaultValue=""
                  />
                  <label htmlFor="bbbPW">BigBlueButton</label>
                  <p />
                </div>
              </div>
              <input
                type="password"
                id="moodlePW"
                size="30"
                name="moodlePW"
                placeholder=""
                defaultValue=""
              />
              <label htmlFor="moodlePW">Moodle-Passwort</label>
              <p />
              <button onClick={saveSettings} id="sbb">
                Speichern
              </button>
            </div>
            <p style={{ color: 'white' }}>
              <b>BBZ Cloud App Version:</b> {versionApp} <br />{' '}
              <b>Entwickelt von:</b>{' '}
              <a
                href="https://web.koyu.space"
                target="_blank"
                style={{ color: 'white' }}
                rel="noreferrer"
              >
                Leonie
              </a>
            </p>
          </div>
        </div>
        <div id="loading">
          <span className="loader" />
          <p>
            <small style={{ color: '#fff' }}>Lädt...</small>
          </p>
        </div>
        <div id="error">
          <img
            src={monkey}
            height="90"
            alt="monkey"
            style={{ cursor: 'pointer' }}
            onClick={reloadPage}
            onKeyDown={reloadPage}
          />
          <h3>
            Da konnte irgendetwas nicht geladen werden! Ein Klick auf den Affen
            lädt die App neu!
          </h3>
        </div>
      </div>
    );
  }
}
