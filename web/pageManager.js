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
                var self = this;
                makeCall("POST", "home/addMeeting", form, function (req) {
                    if (req.readyState == XMLHttpRequest.DONE) {
                        var message = req.responseText;
                        switch (req.status) {
                            case 200:
                                self.modal.show();
                                break;
                            case 400: // bad request
                                self.setAsError("Bad Request", message);
                                break;
                            case 401: // unauthorized
                                self.setAsError("Unauthorized", message);
                                break;
                            case 500: // server error
                                self.setAsError("Internal server error", message);
                                break;
                        }
                    }
                }, true);

            } else {
                form.reportValidity();
            }

        });

        this.increaseTry = function () {
            this.numOfTries = this.numOfTries +1;
            if(this.numOfTries >= 3){
                this.reset()
                this.modal.setAsError("Attention","Three tries to create a meeting with more than " + this.meeting.maxPartecipants-1 + " people, the meeting will not be created.");
                return true;
            }
            return false;
        }

        this.reset = function() {
            this.numOfTries = 0;
            this.modal.hide();
        }

    }

    function ModalWindow(_modalWindows, modalObjects) {
        this.modal = _modalWindows;
        this.cancelButton = modalObjects['modalCancelButton'];
        this.submitButton = modalObjects['modalSubmitButton'];
        this.modalTitle = modalObjects['modalTitle'];
        this.modalErrorContainer = modalObjects['modalErrorContainer'];
        this.modalBodyMessage = modalObjects['modalBodyMessage'];
        this.modalBody = modalObjects['modalBody'];
        this.form = modalObjects['modalInternalForm'];
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

            var self = this;
            makeCall("GET", "home/getAvailableUsers", null, function (req) {
                if(req.readyState === 4){
                    var message = req.responseText;
                    if(req.status == 200){
                        var availablePeople = JSON.parse(req.responseText);
                        if(availablePeople.length == 0){
                            self.setAsError("No people found", "No users are available for a meeting invitation");
                            return;
                        }
                        self.update(availablePeople);
                    } else {
                        self.setAsError("Error", message);
                    }
                }
            });
            this.modal.style.display = "block";
        }

        this.update = function(data){
            var inputGroup, input, label;
            this.form.innerHTML = "<input type='hidden' name='step' value='secondStep'/>";
            data.forEach(function (person) {
                inputGroup = document.createElement("div");
                inputGroup.className = "inputGroup";

                input = document.createElement("input");
                input.type = "checkbox";
                input.name = "invitations";
                input.value = person.id;
                input.with = "id="+person.id;
                input.id = person.id;

                label = document.createElement("label");
                label.for = person.id;
                label.textContent = person.username;

                inputGroup.appendChild(input);
                inputGroup.appendChild(label);
                this.form.appendChild(inputGroup);
            });
        }

        this.hide = function() {
            this.reset();
            this.modal.style.display = "none";
        }

        this.reset = function () {
            this.modalTitle.textContent = "Master data";
            this.modalErrorContainer.hidden = true;
            this.modalBody.hidden = true;

        }

        this.setAsError = function(title, message) {
            this.modalTitle.textContent = title;
            this.modalBody.hidden = false;
            this.modalBody.hidden = true;
            this.modalBody.innerHTML = "";
            var paragraphElement = document.createElement("p");
            paragraphElement.textContent = message;
            this.modalBody.appendChild(paragraphElement);
            this.modal.style.display="block";
        }

        this.cancelButton.addEventListener("click", (e) => {
            this.form.reset();
            wizard.reset();
        });

        this.submitButton.addEventListener("click", (e) => {
            var checkboxes = e.target.closest("form").querySelector("input[type='checkbox']");
            var counter = 0;
            checkboxes.forEach(function (cb) {
                if(cb.checked){
                    counter++;
                }
            });
            if(counter <= wizard.meeting.maxPartecipants-1){
                var self = this;
                makeCall("POST", "home/addMeeting", e.target.closest("form"), function (req) {
                    if (req.readyState == XMLHttpRequest.DONE) {
                        var message = req.responseText;
                        switch (req.status) {
                            case 200:
                                self.hide();
                                pageOrchestrator.refresh();
                                break;
                            case 400: // bad request
                                self.setAsError("Bad Request", message);
                                break;
                            case 401: // unauthorized
                                self.setAsError("Unauthorized", message);
                                break;
                            case 500: // server error
                                self.setAsError("Internal server error", message);
                                break;
                        }
                    }
                }, true)
            } else {
                if(!wizard.increaseTry()){
                    this.modalBodyMessage.textContent = "Too much people selected, please delete at least " + counter-wizard.meeting.maxPartecipants-1 + "people";
                }
            }
        });

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

            let newMeetingModal = new ModalWindow(document.getElementById("createMeetingModal"), {
                modalCancelButton:document.getElementById("modalCancelButton"),
                modalSubmitButton: document.getElementById("modalSubmitButton"),
                modalInternalForm: document.getElementById("modalInternalForm"),
                modalTitle: document.getElementById("modalTitle"),
                modalBody: document.getElementById("modalBodyContainer"),
                modalBodyMessage: document.getElementById("modalBodyMessage"),
                modalErrorContainer: document.getElementById("modalErrorContainer")
            });

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