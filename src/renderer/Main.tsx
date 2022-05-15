/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-var */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable func-names */
import React from 'react';
import $ from 'jquery';
import monkey from '../../assets/monkey.png';
import doge from '../../assets/uebersicht.png'; // TODO: Replace doge with something more suitable. Might be fine though, because everybody likes dogs.

function reloadPage() {
  window.location.reload();
}

export default class Main extends React.Component {
  componentDidMount() {
    $('#main').hide();
    $('#error').hide();
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
      const isTeacher = true;
      $.getJSON(
        'https://privateorg-pink-platypus.github.io/bbz-cloud/object.json',
        function (links) {
          // TODO: Add menu for smaller screens
          for (const [key, e] of Object.entries(links)) {
            if (e.enabled) {
              if (e.teacher === true && isTeacher === true) {
                $('#apps').append(
                  `<a onClick="changeUrl('${key}')" target="_blank" class="link-${key} app" style="cursor:pointer;"><img src="${e.icon}" height="24" title=${key}></a>`
                );
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
                $('#apps').append(
                  `<a onClick="changeUrl('${key}')" target="_blank" class="link-${key} app" style="cursor:pointer;"><img src="${e.icon}" height="24" title=${key}></a>`
                );
                $('#views').append(
                  `<webview
                  id="wv-${key}"
                  class="wv web-${key}"
                  src="${e.url}"
                  style="display:inline-flex; width:100%; height:91.5vh;"
                  allowpopups></webview>`
                );
              }
              // $('#apps').append(
              //  `<a onClick="${ipcRenderer.send('showPreferences');}" target="_blank" class="link-${key} app" style="cursor:pointer;"><img src="settings.png" height="24" title="Einstellungen"></a>`
              // );
              $('#buttons').append(
                `<span onClick="reloadView('${key}')" class="wvbr webbr-${key}" style="cursor:pointer;"><img height="22" style="vertical-align:middle;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNDg5LjUzMyA0ODkuNTMzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODkuNTMzIDQ4OS41MzM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMjY4LjE3NSw0ODguMTYxYzk4LjItMTEsMTc2LjktODkuNSwxODguMS0xODcuN2MxNC43LTEyOC40LTg1LjEtMjM3LjctMjEwLjItMjM5LjF2LTU3LjZjMC0zLjItNC00LjktNi43LTIuOQoJCWwtMTE4LjYsODcuMWMtMiwxLjUtMiw0LjQsMCw1LjlsMTE4LjYsODcuMWMyLjcsMiw2LjcsMC4yLDYuNy0yLjl2LTU3LjVjODcuOSwxLjQsMTU4LjMsNzYuMiwxNTIuMywxNjUuNgoJCWMtNS4xLDc2LjktNjcuOCwxMzkuMy0xNDQuNywxNDQuMmMtODEuNSw1LjItMTUwLjgtNTMtMTYzLjItMTMwYy0yLjMtMTQuMy0xNC44LTI0LjctMjkuMi0yNC43Yy0xNy45LDAtMzEuOSwxNS45LTI5LjEsMzMuNgoJCUM0OS41NzUsNDE4Ljk2MSwxNTAuODc1LDUwMS4yNjEsMjY4LjE3NSw0ODguMTYxeiIgc3R5bGU9ImZpbGw6I2ZmZjsiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"></span>`
              );
              $('#buttons').append(
                `<span onClick="back('${key}')" class="wvbb webbb-${key}" style="cursor:pointer;vertical-align:middle;font-size:22pt;font-weight:bold;margin-left:10px;">&larr;</span>`
              );
              $('#buttons').append(
                `<span onClick="forward('${key}')" class="wvbf webbf-${key}" style="cursor:pointer;vertical-align:middle;font-size:22pt;font-weight:bold;margin-left:10px;">&rarr;</span>`
              );
              $('.wv').hide();
              $('.wvbr').hide();
              $('.wvbb').hide();
              $('.wvbf').hide();
            }
          }
        }
      );
    }, 3000);

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.keyCode === 32) {
        $('#doge').html(
          '<video src="https://f001.backblazeb2.com/file/koyuspace-media/cache/media_attachments/files/108/216/721/989/948/797/original/4523bd1f0de68193.mp4" width="640" height="480" autoplay></video>'
        );
      }
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
                  <img
                    src="https://www.bbz-rd-eck.de/wp-content/uploads/2018/09/BBZ-Logo-Master.png"
                    alt="BBZ Logo"
                    height="32"
                    id="logo"
                  />
                  <h1>BBZ Cloud</h1>
                </p>
                <p>
                  In Rendsburg-Eckernförde sind es aktuell{' '}
                  <span id="temperature" />
                  °C
                </p>
              </div>
              <div id="apps" />
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
        </div>
      </div>
    );
  }
}
