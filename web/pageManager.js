/**
 * Website page controller
 */
(function(){
    var availableMeetings, myMeetings, wizard, pageOrchestrator = new PageOrchestrator();

    window.addEventListener("load", () => {
        if(sessionStorage.getItem("username") == null){
            window.location.href = "index.html";
        } else {
            pageOrchestrator.start();
            pageOrchestrator.refresh();
        }
    }, false);

    function WelcomeMessage(_username, messageContainer){
        this.username = _username;
        this.show = function () {
            messageContainer.textContent = this.username;
        }
    }



    function AvailableMeetings (_alertContainer, _meetingsContainer, _meetingsContainerBody) {
        this.alertContainer = _alertContainer;
        this.meetingsContainer = _meetingsContainer;
        this.meetingsContainerBody = _meetingsContainerBody;

        this.reset = function () {
            this.meetingsContainer.style.visibility = "hidden";
        }

        this.show = function () {
            const self = this;
            makeCall("GET", "home/availableMeetings", null, function (req) {
                if(req.readyState === 4){
                    var message = req.responseText;
                    if(req.status == 200){
                        var availableMeetings = JSON.parse(req.responseText);
                        if(availableMeetings.length == 0){
                            self.alertContainer.className = "alert alert-primary";
                            self.alertContainer.textContent = "No available meetings";
                            self.alertContainer.hidden = false;
                            return;
                        }
                        self.update(availableMeetings);
                    } else {
                        self.alertContainer.className="alert alert-danger";
                        self.alertContainer.textContent = message;
                        self.alertContainer.hidden = false;
                    }
                }
            })
        }

        this.update = function(meetingsList) {
            var row, titleCell, dateCell, durationCell, partecipantCell;
            this.meetingsContainerBody.innerHTML = "";
            const self = this;
            meetingsList.forEach(function (meeting) {
                row = document.createElement("tr");
                titleCell = document.createElement("td");
                titleCell.textContent = meeting.title;
                row.appendChild(titleCell);

                dateCell = document.createElement("td");
                dateCell.textContent = meeting.dateTime;
                row.appendChild(dateCell);

                durationCell = document.createElement("td");
                durationCell.textContent = meeting.duration;
                row.appendChild(durationCell);

                partecipantCell = document.createElement("td");
                partecipantCell.textContent = meeting.maxParticipants;
                row.appendChild(partecipantCell);
                self.meetingsContainerBody.appendChild(row);
            });
            this.meetingsContainer.style.visibility = "visible";
        }
    }

    function MyMeetings (_alertContainer, _meetingsContainer, _meetingsContainerBody) {
        this.alertContainer = _alertContainer;
        this.meetingsContainer = _meetingsContainer;
        this.meetingsContainerBody = _meetingsContainerBody;

        this.reset = function () {
            this.meetingsContainer.style.visibility = "hidden";
        }

        this.show = function () {
            const self = this;
            makeCall("GET", "home/myMeetings", null, function (req) {
                if(req.readyState === 4){
                    var message = req.responseText;
                    if(req.status == 200){
                        var availableMeetings = JSON.parse(req.responseText);
                        if(availableMeetings.length == 0){
                            self.alertContainer.className = "alert alert-primary";
                            self.alertContainer.textContent = "No available meetings";
                            self.alertContainer.hidden = false;
                            return;
                        }
                        self.update(availableMeetings);
                    } else {
                        self.alertContainer.className="alert alert-danger";
                        self.alertContainer.textContent = message;
                        self.alertContainer.hidden = false;
                    }
                }
            })
        }

        this.update = function(meetingsList) {
            var row, titleCell, dateCell, durationCell, partecipantCell;
            this.meetingsContainerBody.innerHTML = "";
            const self = this;
            meetingsList.forEach(function (meeting) {
                row = document.createElement("tr");
                titleCell = document.createElement("td");
                titleCell.textContent = meeting.title;
                row.appendChild(titleCell);

                dateCell = document.createElement("td");
                dateCell.textContent = meeting.dateTime;
                row.appendChild(dateCell);

                durationCell = document.createElement("td");
                durationCell.textContent = meeting.duration;
                row.appendChild(durationCell);

                partecipantCell = document.createElement("td");
                partecipantCell.textContent = meeting.maxParticipants;
                row.appendChild(partecipantCell);
                self.meetingsContainerBody.appendChild(row);
            });
            this.meetingsContainer.style.visibility = "visible";
        }
    }

    function Wizard(_wizardId, _modalWindow, _alertContainer){
        this.modal = _modalWindow;
        this.alertContainer = _alertContainer;
        this.wizard = _wizardId;

        this.numOfTries = 0;
        this.meeting =  null;

        this.wizard.querySelector("input[id='resetMeetingButton']").addEventListener("click", (e) => {
            e.target.closest("form").reset();
            this.reset();
        });

        this.wizard.querySelector("input[id='addMeetingButton']").addEventListener("click", (e) => {
            const form = e.target.closest("form");
            if(form.checkValidity()){
                this.meeting = {
                    title: form['meetingName'],
                    date: form['meetingDate'],
                    time: form['meetingTime'],
                    duration: form['meetingDuration'],
                    maxPartecipants: form['meetingMaxParticipants']
                }

                this.modal.show();
            } else {
                form.reportValidity();
            }

        });

        this.increaseTry = function () {
            this.numOfTries = this.numOfTries +1;
            if(this.numOfTries >= 3){
                this.reset()
                this.modal.setAsError("Attention","Three tries to create a meeting with more than " + this.meeting.maxPartecipants + " people, the meeting will not be created.");
            }
        }

        this.reset = function() {
            this.numOfTries = 0;
            this.modal.hide();
        }

    }

    function ModalWindow(_modalWindows) {
        this.modal = _modalWindows;
        this.closeButton = this.modal.getElementsByClassName("close")[0]; //Get the specific modal close button

        this.closeButton.addEventListener("click", () => {
           this.hide();
        });

        window.addEventListener("click", (e) => {
            if(e.target == this.modal){
                this.hide();
            }
        });

        this.show = function () {
            this.modal.style.display = "block";
        }

        this.hide = function() {
            this.reset();
            this.modal.style.display = "none";
        }

        this.reset = function () {
            this.modal.getElementsByClassName("modalTitle")[0].textContent = "Master data";
            this.modal.getElementsByClassName("errorContainer")[0].hidden = true;
            var modalBody = this.modal.getElementsByClassName("modalBodyContainer")[0];
            modalBody.hidden = true;

        }

        this.setAsError = function(title, message) {
            this.modal.getElementsByClassName("modalTitle")[0].textContent = title;
            var modalBody = this.modal.getElementsByClassName("errorContainer")[0];
            modalBody.hidden = false;
            this.modal.getElementsByClassName("modalBodyContainer").hidden = true;
            modalBody.innerHTML = "";
            var paragraphElement = document.createElement("p");
            paragraphElement.textContent = message;
            modalBody.appendChild(paragraphElement);
        }


    }

    function PageOrchestrator() {
        const myMeetingsAlertContainer = document.getElementById("myMeetingsAlertContainer");
        const availableMeetingsAlertContainer = document.getElementById("availableMeetingsAlertContainer");
        const wizardAlertContainer = document.getElementById("wizardAlertContainer");
        this.start = function () {
            myMeetingsAlertContainer.hidden = true;
            availableMeetingsAlertContainer.hidden = true;
            const welcomeMessage = new WelcomeMessage(sessionStorage.getItem("username"), document.getElementById("usernameText"));
            welcomeMessage.show();

            availableMeetings = new AvailableMeetings(availableMeetingsAlertContainer, document.getElementById("availableMeetingsTable"), document.getElementById("availableMeetingsTableBody"));
            myMeetings = new MyMeetings(myMeetingsAlertContainer, document.getElementById("myMeetingsTable"), document.getElementById("myMeetingsTableBody"));

            let newMeetingModal = new ModalWindow(document.getElementById("createMeetingModal"));

            wizard = new Wizard(document.getElementById("newMeetingWizard"), newMeetingModal, wizardAlertContainer);


            document.querySelector("a[href='logout']").addEventListener('click', () => {
               window.sessionStorage.removeItem("username");
            });
        }

        this.refresh = function () {
            myMeetingsAlertContainer.hidden = true
            availableMeetingsAlertContainer.hidden = true;
            availableMeetings.reset();
            myMeetings.reset();
            availableMeetings.show();
            myMeetings.show();
            wizard.reset();
        }
    }
})();