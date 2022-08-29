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
