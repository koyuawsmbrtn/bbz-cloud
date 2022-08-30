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
import monkey from '../../assets/monkey.png';
import u1 from '../../assets/uebersicht.png';
import u2 from '../../assets/doge.png';
import sb from '../../assets/settings.png';
import links from '../../assets/object.json';
import logo from '../../assets/logo.png';
import version from '../../package.json';
import isTeacherVar from '../../assets/isTeacher.json';

const versionApp = version.version;
let zoomFaktor = 1.0;

if (
  localStorage.getItem('zoomFaktor') !== null &&
  parseFloat(localStorage.getItem('zoomFaktor')) > 0
) {
  zoomFaktor = parseFloat(localStorage.getItem('zoomFaktor'));
}

// Hierin werden die Credentials des Users gespeichert - momentan noch unser über localStorage
let outlookUsername = 'dennis.clausen@juchu.de';
let outlookPassword = 'test';
let moodleUsername = 'dennis.clausen@juchu.de';
let moodlePassword = 'test';
// get Credentials from localStorage
// Outlook
if (localStorage.getItem('outlookUsername') !== null) {
  outlookUsername = localStorage.getItem('outlookUsername');
}
if (localStorage.getItem('outlookPassword') !== null) {
  outlookPassword = localStorage.getItem('outlookPassword');
}
// Moodle
if (localStorage.getItem('moodleUsername') !== null) {
  moodleUsername = localStorage.getItem('moodleUsername');
}
if (localStorage.getItem('moodlePassword') !== null) {
  moodlePassword = localStorage.getItem('moodlePassword');
}

window.api.send('zoom', zoomFaktor);

var doge;
const isTeacher = isTeacherVar.value;
if (isTeacher) {
  doge = u1;
} else {
  doge = u2;
}

function reloadPage() {
  window.location.reload();
}

function saveSettings() {
  // Autostart Settings
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
  // Custom WebApps Settings
  const custom1_url = document.getElementById('custom1_url').value;
  const custom1_icon = document.getElementById('custom1_icon').value;
  localStorage.setItem('custom1_url', custom1_url);
  localStorage.setItem('custom1_icon', custom1_icon);
  const custom2_url = document.getElementById('custom2_url').value;
  const custom2_icon = document.getElementById('custom2_icon').value;
  localStorage.setItem('custom2_url', custom2_url);
  localStorage.setItem('custom2_icon', custom2_icon);
  window.location.reload();
}

export default class Main extends React.Component {
  componentDidMount() {
    localStorage.setItem('isClickable', 'true');
    $('#main').hide();
    $('#error').hide();
    $('#settings').hide();
    $('#settingsb').click(function () {
      $('#settings').show();
      $('#content').hide();
      $('#buttons').css('visibility', 'hidden');
      $('body').css('overflow', 'overlay');
      localStorage.setItem('isClickable', 'false');
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
    window.setTimeout(() => {
      $('#loading').hide();
      $('#main').show();
      $('body').css('background', `#fff`);
      for (const [key, e] of Object.entries(links)) {
        if (e.enabled) {
          if (e.teacher === true && isTeacher === true) {
            $('#appchecks').append(
              `<p><input type="checkbox" id="check-${key}" onClick="toggleApp('${key}')" /> ${key}</p>`
            );
            if (localStorage.getItem(`checked-${key}`) === null) {
              localStorage.setItem(`checked-${key}`, 'true');
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
                  style="display:inline-flex; width:100%; height:91.5vh;"
                  allowpopups></webview>`
            );
          }
          if (e.teacher === false) {
            $('#appchecks').append(
              `<p><input type="checkbox" id="check-${key}" onClick="toggleApp('${key}')" /> ${key}</p>`
            );
            if (localStorage.getItem(`checked-${key}`) === null) {
              localStorage.setItem(`checked-${key}`, 'true');
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
                  style="display:inline-flex; width:100%; height:91.5vh;"
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
      }
      if (
        localStorage.getItem(`custom1_url`) != '' &&
        localStorage.getItem(`custom1_url`) != null
      ) {
        const custom1_url = localStorage.getItem(`custom1_url`);
        const custom1_icon = localStorage.getItem(`custom1_icon`);
        $('#custom1_url').attr('value', custom1_url);
        $('#custom1_icon').attr('value', custom1_icon);
        $('#apps').append(
          `<a onClick="changeUrl('custom1')" target="_blank" class="link-custom1 app" style="cursor:pointer;"><img src="${custom1_icon}" height="20" title="Benutzerapp1"></a>`
        );
        $('#views').append(
          `<webview
              id="wv-custom1"
              class="wv web-custom1"
              src="${custom1_url}"
              style="display:inline-flex; width:100%; height:91.5vh;"
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
              style="display:inline-flex; width:100%; height:91.5vh;"
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
        wv.addEventListener('did-finish-load', (event) => {
          if (wv.id === 'wv-Outlook') {
            console.log('Outlook!');
            wv.executeJavaScript(
              `document.querySelector('#userNameInput').value = "${outlookUsername}"`
            );
            wv.executeJavaScript(
              `document.querySelector('#passwordInput').value = "${outlookPassword}"`
            );
          }
          if (wv.id === 'wv-BBZPortal') {
            wv.executeJavaScript(
              `document.querySelector('#username').value = "${moodleUsername}"`
            );
            wv.executeJavaScript(
              `document.querySelector('#password').value = "${moodlePassword}"`
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

    /* document.querySelectorAll('webview').forEach((wv) => {
      wv.addEventListener('did-start-loading'),
        () =>
          document
            .querySelectorAll('webview')
            .forEach(windows.api.send('loadingStartorStop', currentURL));
    }); */

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.keyCode === 32) {
        $('#doge').html(
          '<video src="https://f001.backblazeb2.com/file/koyuspace-media/cache/media_attachments/files/108/216/721/989/948/797/original/4523bd1f0de68193.mp4" width="640" height="480" autoplay></video>'
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
              <input type="checkbox" id="autostart" name="autostart_onoff" />
              <label htmlFor="autostart_onoff">
                App beim Login am Computer automatisch starten
              </label>
              <h2>Apps aktivieren/deaktivieren</h2>
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
              <p>
                <b>BBZ Cloud App Version:</b> {versionApp} |{' '}
                <b>Entwicklerin:</b> Leonie
              </p>
              <button onClick={saveSettings} id="sbb">
                Speichern
              </button>
            </div>
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
