/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable vars-on-top */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-use-before-define */
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
import links from '../../assets/object.json';
import logo from '../../assets/logo.png';
import version from '../../package.json';
import isTeacherVar from '../../assets/isTeacher.json';

// global (to renderer) variables
const versionApp = version.version;
let zoomFaktor = 1.0;
let wvHeight = '91.5vh';
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
};

if (
  localStorage.getItem('zoomFaktor') !== null &&
  parseFloat(localStorage.getItem('zoomFaktor')) > 0
) {
  zoomFaktor = parseFloat(localStorage.getItem('zoomFaktor'));
}

window.api.send('zoom', zoomFaktor);

// starting image - dependend on, which version is compiled
var doge;
const isTeacher = isTeacherVar.value;
if (isTeacher) {
  doge = u1;
} else {
  doge = u2;
}

// Hierin werden die Credentials des Users aus dem Keyring des jeweiligen System geholt
// Ein Sammelobjekt wird übertragen statt einzelner ipc-Anfragen
window.api.receive('getPassword', (result) => {
  creds = result;
});
window.api.send('getPassword');

// on 'notifications' trigger changeUrl to correct app
window.api.receive('notifications', (result: string) => {
  console.log('notification-renderer: ', result);
  // changeUrl(result);
});

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
    changeUrl(result);
  }
});
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
    changeUrl(result);
  }

function resetCredsAreSet() {
  credsAreSet.bbb = false;
  credsAreSet.moodle = false;
  credsAreSet.outlook = false;
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

  // Save Custom WebApps Settings
  const custom1_url = document.getElementById('custom1_url').value;
  const custom1_icon = document.getElementById('custom1_icon').value;
  localStorage.setItem('custom1_url', custom1_url);
  localStorage.setItem('custom1_icon', custom1_icon);
  const custom2_url = document.getElementById('custom2_url').value;
  const custom2_icon = document.getElementById('custom2_icon').value;
  localStorage.setItem('custom2_url', custom2_url);
  localStorage.setItem('custom2_icon', custom2_icon);

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

window.api.receive('resize', (result) => {
  wvHeight = `${((result - 60) * zoomFaktor).toString}px`;
});

window.api.receive('resize', (result) => {
  wvHeight = `${((result - 60) * zoomFaktor).toString}px`;
});

export default class Main extends React.Component {
  async componentDidMount() {
    localStorage.setItem('isClickable', 'true');
    $('#main').hide();
    $('#error').hide();
    $('#settings').hide();
    $('#download').hide();
    $('#download_label').hide();
    $('#updateButton').hide();
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
      $('#main').show();
      $('body').css('background', `#fff`);
      window.setInterval(() => {
        if (!isTeacher) {
          $('.teacher').hide();
        }
      });
      for (const [key, e] of Object.entries(links)) {
        if (e.teacher === true && isTeacher === true) {
          $('#appchecks').append(
            `<p><input type="checkbox" id="check-${key}" onClick="toggleApp('${key}')" /> ${key}</p>`
          );
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
            `<a onClick="changeUrl('${key}')" target="_blank" class="link-${key} app" style="cursor:pointer;"><img src="${e.icon}" height="20" title=${key}></a>`
          );
          if (localStorage.getItem(`checked-${key}`) === 'false') {
            $(`.link-${key}`).hide();
          }
          $('#views').append(
            `<webview
                id="wv-${key}"
                class="wv web-${key}"
                src="${e.url}"
                style="display:inline-flex; width:100%; height:${wvHeight};"
                allowpopups></webview>`
          );
        }
        if (e.teacher === false) {
          $('#appchecks').append(
            `<p><input type="checkbox" id="check-${key}" onClick="toggleApp('${key}')" /> ${key}</p>`
          );
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
            `<a onClick="changeUrl('${key}')" target="_blank" class="link-${key} app" style="cursor:pointer;"><img src="${e.icon}" height="20" title=${key}></a>`
          );
          if (localStorage.getItem(`checked-${key}`) === 'false') {
            $(`.link-${key}`).hide();
          }
          $('#views').append(
            `<webview
                id="wv-${key}"
                class="wv web-${key}"
                src="${e.url}"
                style="display:inline-flex; width:100%; height:${wvHeight};"
                allowpopups></webview>`
          );
        }
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
      if (
        localStorage.getItem(`custom1_url`) !== '' &&
        localStorage.getItem(`custom1_url`) !== null
      ) {
        const custom1_url = localStorage.getItem(`custom1_url`);
        const custom1_icon = localStorage.getItem(`custom1_icon`);
        $('#custom1_url').attr('value', custom1_url);
        $('#custom1_icon').attr('value', custom1_icon);
        $('#emailAdress').attr('value', creds.outlookUsername);
        $('#teacherID').attr('value', creds.moodleUsername);
        $('#outlookPW').attr('value', creds.outlookPassword);
        $('#moodlePW').attr('value', creds.moodlePassword);
        $('#bbbPW').attr('value', creds.bbbPassword);
        $('#apps').append(
          `<a onClick="changeUrl('custom1')" target="_blank" class="link-custom1 app" style="cursor:pointer;"><img src="${custom1_icon}" height="20" title="Benutzerapp1"></a>`
        );
        $('#views').append(
          `<webview
              id="wv-custom1"
              class="wv web-custom1"
              src="${custom1_url}"
              style="display:inline-flex; width:100%; height:${wvHeight};"
              allowpopups></webview>`
        );
        $('#buttons').append(
          `<span onClick="reloadView('custom1')" class="wvbr webbr-custom1" style="cursor:pointer;"><img height="20" style="vertical-align:middle;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNDg5LjUzMyA0ODkuNTMzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuNTMzIDQ4OS41MzM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMjY4LjE3NSw0ODguMTYxYzk4LjItMTEsMTc2LjktODkuNSwxODguMS0xODcuN2MxNC43LTEyOC40LTg1LjEtMjM3LjctMjEwLjItMjM5LjF2LTU3LjZjMC0zLjItNC00LjktNi43LTIuOQoJCWwtMTE4LjYsODcuMWMtMiwxLjUtMiw0LjQsMCw1LjlsMTE4LjYsODcuMWMyLjcsMiw2LjcsMC4yLDYuNy0yLjl2LTU3LjVjODcuOSwxLjQsMTU4LjMsNzYuMiwxNTIuMywxNjUuNgoJCWMtNS4xLDc2LjktNjcuOCwxMzkuMy0xNDQuNywxNDQuMmMtODEuNSw1LjItMTUwLjgtNTMtMTYzLjItMTMwYy0yLjMtMTQuMy0xNC44LTI0LjctMjkuMi0yNC43Yy0xNy45LDAtMzEuOSwxNS45LTI5LjEsMzMuNgoJCUM0OS41NzUsNDE4Ljk2MSwxNTAuODc1LDUwMS4yNjEsMjY4LjE3NSw0ODguMTYxeiIgc3R5bGU9ImZpbGw6I2ZmZjsiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"></span>`
        );
        $('#buttons').append(
          `<span onClick="back('custom1')" class="wvbb webbb-custom1" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:10px;">&larr;</span>`
        );
        $('#buttons').append(
          `<span onClick="forward('custom1')" class="wvbf webbf-custom1" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:10px;">&rarr;</span>`
        );
        $('#buttons').append(
          `<span onClick="copyUrl('custom1')" class="wvbc webbc-custom1" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:10px;"><i class="fa fa-files-o" aria-hidden="true"></i></span>`
        );
      }
      if (
        localStorage.getItem(`custom2_url`) !== '' &&
        localStorage.getItem(`custom2_url`) != null
      ) {
        const custom2_url = localStorage.getItem(`custom2_url`);
        const custom2_icon = localStorage.getItem(`custom2_icon`);
        $('#custom2_url').attr('value', custom2_url);
        $('#custom2_icon').attr('value', custom2_icon);
        $('#apps').append(
          `<a onClick="changeUrl('custom2')" target="_blank" class="link-custom2 app" style="cursor:pointer;"><img src="${custom2_icon}" height="20" title="Benutzerapp2"></a>`
        );
        $('#views').append(
          `<webview
              id="wv-custom2"
              class="wv web-custom2"
              src="${custom2_url}"
              style="display:inline-flex; width:100%; height:${wvHeight};"
              allowpopups></webview>`
        );
        $('#buttons').append(
          `<span onClick="reloadView('custom2')" class="wvbr webbr-custom2" style="cursor:pointer;"><img height="20" style="vertical-align:middle;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNDg5LjUzMyA0ODkuNTMzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuNTMzIDQ4OS41MzM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMjY4LjE3NSw0ODguMTYxYzk4LjItMTEsMTc2LjktODkuNSwxODguMS0xODcuN2MxNC43LTEyOC40LTg1LjEtMjM3LjctMjEwLjItMjM5LjF2LTU3LjZjMC0zLjItNC00LjktNi43LTIuOQoJCWwtMTE4LjYsODcuMWMtMiwxLjUtMiw0LjQsMCw1LjlsMTE4LjYsODcuMWMyLjcsMiw2LjcsMC4yLDYuNy0yLjl2LTU3LjVjODcuOSwxLjQsMTU4LjMsNzYuMiwxNTIuMywxNjUuNgoJCWMtNS4xLDc2LjktNjcuOCwxMzkuMy0xNDQuNywxNDQuMmMtODEuNSw1LjItMTUwLjgtNTMtMTYzLjItMTMwYy0yLjMtMTQuMy0xNC44LTI0LjctMjkuMi0yNC43Yy0xNy45LDAtMzEuOSwxNS45LTI5LjEsMzMuNgoJCUM0OS41NzUsNDE4Ljk2MSwxNTAuODc1LDUwMS4yNjEsMjY4LjE3NSw0ODguMTYxeiIgc3R5bGU9ImZpbGw6I2ZmZjsiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"></span>`
        );
        $('#buttons').append(
          `<span onClick="back('custom2')" class="wvbb webbb-custom2" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:10px;">&larr;</span>`
        );
        $('#buttons').append(
          `<span onClick="forward('custom2')" class="wvbf webbf-custom2" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:10px;">&rarr;</span>`
        );
        $('#buttons').append(
          `<span onClick="copyUrl('custom2')" class="wvbc webbc-custom2" style="cursor:pointer;vertical-align:middle;font-size:20pt;font-weight:bold;margin-left:10px;"><i class="fa fa-files-o" aria-hidden="true"></i></span>`
        );
      }
      if (localStorage.getItem('autostart') === 'true') {
        $('#autostart').attr('checked', 'true');
      }

// Credentials in die einzelnen WebViews einfügen
      document.querySelectorAll('webview').forEach((wv) => {
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
          // Autofill Moodle
          if (wv.id === 'wv-BBZPortal' && credsAreSet.moodle === false) {
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
      window.api.send('runUpdate');
    });

    const debugMenu = `
    <button onClick="showUpdate()">Fake update</button>\n
    <button onClick="fakeDownload()">Fake download</button>\n
    <button onClick="location.reload()">Reload</button>\n
    <button onClick="deleteAndReload()">Delete config &amp; Reload</button>\n
    `;
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.altKey && event.keyCode === 68) {
        smalltalk.alert('Super secret debug menu', debugMenu);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.keyCode === 32) {
        // Easter Egg ;)
        $('#doge').html(
          '<video src="https://f001.backblazeb2.com/file/koyuspace-media/pleroma/8f9f1c1f-6199-4a54-bf42-36252e66c353/rickroll.mp4" width="640" height="480" autoplay loop></video>'
        );
      } else if (event.ctrlKey && event.keyCode === 187) {
        zoomFaktor += 0.1; // Zoom in um 10%
        if (zoomFaktor > 5.0) {
          zoomFaktor = 5.0;
        }
      } else if (event.ctrlKey && event.keyCode === 189) {
        zoomFaktor -= 0.1; // Zoom in um 10%
        if (zoomFaktor < 0.2) {
          zoomFaktor = 0.2;
        }
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
            <div id="doge">
              <img
                style={{ marginLeft: '10px', marginTop: '15px' }}
                height="560"
                src={doge}
                alt="Übersicht"
              />
            </div>
          </div>
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
                <h2>Benutzerdefinierte Webapp hinzufügen</h2>
                <h3>Erste benutzerdefinierte App</h3>
                <input
                  type="text"
                  id="custom1_url"
                  size="50"
                  name="url_website"
                  placeholder="https://example.com"
                />
                <label htmlFor="url_website">URL der Website</label>
                <p />
                <input
                  type="text"
                  id="custom1_icon"
                  size="50"
                  name="icon_website"
                  placeholder="https://example.com/icon.png"
                />
                <label htmlFor="icon_website">Icon der Website</label>
                <h3>Zweite benutzerdefinierte App</h3>
                <input
                  type="text"
                  id="custom2_url"
                  size="50"
                  name="url_website"
                  placeholder="https://example.com"
                />
                <label htmlFor="url_website">URL der Website</label>
                <p />
                <input
                  type="text"
                  id="custom2_icon"
                  size="50"
                  name="icon_website"
                  placeholder="https://example.com/icon.png"
                />
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
