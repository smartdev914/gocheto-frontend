/* eslint-disable */
function getScope() {
  return self.registration.scope;
}

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function (event) {
  try {
    const url = new URL(event.request.url);
    if (url.pathname.includes('redirect') && url.href.includes(getScope())) {
      event.respondWith(
        new Response(
          new Blob(
            [
              `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Self Custodial Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
        }

        html,
        body {
          background: #22263F;
          height: 100%;
          padding: 0;
          margin: 0;
        }

        .container {
          width: 100%;
          height: 100%;

          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          align-self: stretch;
        }

        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }

        .spinner {
          display: flex;
          width: 80px;
          height: 80px;
          justify-content: center;
          align-items: center;
          -webkit-animation: spin 1500ms cubic-bezier(.51,.98,.87,.77) infinite;
          animation: spin 1500ms cubic-bezier(.51,.98,.87,.77) infinite;
        }

        .info-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex: 1 0 0;
          color: #fff;

          position: absolute;
          left: 0;
          bottom: 28px;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .info-container p {
          color: var(--primary-100, #E6EBFF);
          text-align: center;

          /* Paragraph/Medium/Regular */
          font-family: Sora;
          font-size: .875rem;
          font-style: normal;
          font-weight: 400;
          line-height: 8px;
        }

        .info-container img {
          height: 2.5rem;
        }

        @-webkit-keyframes spin {
          0% { transform: rotate(0deg) }
          90% { transform: rotate(360deg) }
          100% { transform: rotate(360deg) }
        }

        @keyframes example {
          0% { transform: rotate(0deg) }
          90% { transform: rotate(360deg) }
          100% { transform: rotate(360deg) }
      }

        @media (min-width: 768px) {
          h1.title {
            font-size: 14px;
          }
          p.info {
            font-size: 28px;
          }
        }

        @media (max-width: 1024px) {
          .info-container img {
            height: 2rem;
          }
        }
      </style>
  </head>

  <body>
    <div id="message" class="container">
      <div class="content" id="spinner">
        <div class="spinner-container">
            <img class="spinner" src="shib-logo.svg" />
        </div>
        <div class="info-container">
            <p>Self Custodial Login powered by</p>
            <img src="shib-logo-text.svg" />
        </div>
      </div>

    </div>
    <script
      src="https://scripts.toruswallet.io/broadcastChannel_5_0_2.js"
    ></script>
    <script>
      function storageAvailable(type) {
        var storage;
        try {
          storage = window[type];
          var x = "__storage_test__";
          storage.setItem(x, x);
          storage.removeItem(x);
          return true;
        } catch (e) {
          return (
            e &&
            // everything except Firefox
            (e.code === 22 ||
              // Firefox
              e.code === 1014 ||
              // test name field too, because code might not be present
              // everything except Firefox
              e.name === "QuotaExceededError" ||
              // Firefox
              e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
          );
        }
      }
      function showCloseText() {
        var closeText = document.getElementById("closeText");
        var spinner = document.getElementById("spinner");
        if (closeText) {
          closeText.style.display = "block";
        }
        if (spinner) {
          spinner.style.display = "none";
        }
      }
      var isLocalStorageAvailable = storageAvailable("localStorage");
      var isSessionStorageAvailable = storageAvailable("sessionStorage");
      // set theme
      let theme = "light";
      if (isLocalStorageAvailable) {
        var torusTheme = localStorage.getItem("torus-theme");
        if (torusTheme) {
          theme = torusTheme.split("-")[0];
        }
      }

      if (theme === "dark") {
        document.querySelector("body").style.backgroundColor = "#24252A";
      }

      var bc;
      var broadcastChannelOptions = {
        // type: 'localstorage', // (optional) enforce a type, oneOf['native', 'idb', 'localstorage', 'node'
        webWorkerSupport: false, // (optional) set this to false if you know that your channel will never be used in a WebWorker (increase performance)
      };
      var instanceParams = {};
      var preopenInstanceId = new URL(window.location.href).searchParams.get("preopenInstanceId");
      if (!preopenInstanceId) {
        document.getElementById("message").style.visibility = "visible";
        // in general oauth redirect
        try {
          var url = new URL(location.href);
          var hash = url.hash.substr(1);
          var hashParams = {};
          if (hash) {
            hashParams = hash.split("&").reduce(function (result, item) {
              var parts = item.split("=");
              result[parts[0]] = parts[1];
              return result;
            }, {});
          }
          var queryParams = {};
          for (var key of url.searchParams.keys()) {
            queryParams[key] = url.searchParams.get(key);
          }
          var error = "";
          try {
            if (Object.keys(hashParams).length > 0 && hashParams.state) {
              instanceParams = JSON.parse(window.atob(decodeURIComponent(decodeURIComponent(hashParams.state)))) || {};
              if (hashParams.error) error = hashParams.error;
            } else if (Object.keys(queryParams).length > 0 && queryParams.state) {
              instanceParams = JSON.parse(window.atob(decodeURIComponent(decodeURIComponent(queryParams.state)))) || {};
              if (queryParams.error) error = queryParams.error;
            }
          } catch (e) {
            console.error(e);
          }
          if (instanceParams.redirectToOpener) {
            // communicate to window.opener
            window.opener.postMessage(
              {
                channel: "redirect_channel_" + instanceParams.instanceId,
                data: {
                  instanceParams: instanceParams,
                  hashParams: hashParams,
                  queryParams: queryParams,
                },
                error: error,
              },
              "http://localhost:3000"
            );
          } else {
            // communicate via broadcast channel
            bc = new broadcastChannelLib.BroadcastChannel("redirect_channel_" + instanceParams.instanceId, broadcastChannelOptions);
            bc.addEventListener("message", function (ev) {
              if (ev.success) {
                bc.close();
                console.log("posted", {
                  queryParams,
                  instanceParams,
                  hashParams,
                });
              } else {
                window.close();
                showCloseText();
              }
            });
            bc.postMessage({
              data: {
                instanceParams: instanceParams,
                hashParams: hashParams,
                queryParams: queryParams,
              },
              error: error,
            }).then(function () {
              setTimeout(function () {
                const redirectUri = localStorage.getItem("redirectUrl");
                localStorage.setItem("s-login-request", Date.now().toString());
                if (redirectUri && redirectUri !== "") {
                  localStorage.removeItem("redirectUrl");
                  window.location.href = redirectUri + location.hash;
                  //window.location.href = redirectUri + location.search + location.hash;
                }
                else
                  window.location.href = url.origin + location.search + location.hash;
              }, 5000);
            });
          }
        } catch (err) {
          console.error(err, "service worker error in redirect");
          bc && bc.close();
          window.close();
          showCloseText();
        }
      } else {
        // in preopen, awaiting redirect
        try {
          bc = new broadcastChannelLib.BroadcastChannel("preopen_channel_" + preopenInstanceId, broadcastChannelOptions);
          bc.onmessage = function (ev) {
            var { preopenInstanceId: oldId, payload, message } = ev.data;
            if (oldId === preopenInstanceId && payload && payload.url) {
              window.location.href = payload.url;
            } else if (oldId === preopenInstanceId && message === "setup_complete") {
              bc.postMessage({
                data: {
                  preopenInstanceId: preopenInstanceId,
                  message: "popup_loaded",
                },
              });
            }
            if (ev.error && ev.error !== "") {
              console.error(ev.error);
              bc.close();
            }
          };
        } catch (err) {
          console.error(err, "service worker error in preopen");
          bc && bc.close();
          window.close();
          showCloseText();
        }
      }
    </script>
  </body>
</html>

                  ${''}
                    `,
            ],
            { type: 'text/html' }
          )
        )
      );
    }
  } catch (error) {
    console.error(error);
  }
});