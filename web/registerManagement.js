/**
 * Register management
 */

(function () {
    var alertContainer = document.getElementById("alertContainer");
    alertContainer.hidden = true;
    document.getElementById("registerButton").addEventListener("click", (e) => {
        var form = e.target.closest("form");
        if(form.checkValidity()){
            makeCall("POST", "register", form, function(req) {
                if (req.readyState == XMLHttpRequest.DONE) {
                    var message = req.responseText;
                    switch (req.status) {
                        case 200: //ok
                            alertContainer.className = "alert alert-success";
                            alertContainer.textContent = message;
                            alertContainer.hidden = false;
                            break;
                        case 400: // bad request
                            alertContainer.className = "alert alert-danger";
                            alertContainer.textContent = message;
                            alertContainer.hidden = false;
                            break;
                        case 500: // server error
                            alertContainer.className = "alert alert-danger";
                            alertContainer.textContent = message;
                            alertContainer.hidden = false;
                            break;
                    }
                }
            });
        } else {
            form.reportValidity();
        }
    } );
})();