/**
 * Login management
 */

(function() { // avoid variables ending up in the global scope
  var alertContainer = document.getElementById("alertContainer");
  alertContainer.hidden = true;
  document.getElementById("loginbutton").addEventListener('click', (e) => {
    var form = e.target.closest("form");
    if (form.checkValidity()) {
      makeCall("POST", 'login', e.target.closest("form"),
        function(req) {
          if (req.readyState == XMLHttpRequest.DONE) {
            var message = req.responseText;
            switch (req.status) {
              case 200:
            	sessionStorage.setItem('username', message);
                window.location.href = "home.html";
                break;
              case 400: // bad request
                alertContainer.textContent = message;
                alertContainer.hidden = false;
                break;
              case 401: // unauthorized
                alertContainer.textContent = message;
                alertContainer.hidden = false;
                break;
              case 500: // server error
                alertContainer.textContent = message;
                alertContainer.hidden = false;
                break;
            }
          }
        }
      );
    } else {
    	 form.reportValidity();
    }
  });

})();