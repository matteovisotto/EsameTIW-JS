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

    function PageOrchestrator() {
        const myMeetingsAlertContainer = document.getElementById("myMeetingsAlertContainer");
        const availableMeetingsAlertContainer = document.getElementById("availableMeetingsAlertContainer");
        this.start = function () {
            myMeetingsAlertContainer.hidden = true;
            availableMeetingsAlertContainer.hidden = true;
            let welcomeMessage = new WelcomeMessage(sessionStorage.getItem("username"), document.getElementById("usernameText"));
            welcomeMessage.show();

            availableMeetings = new AvailableMeetings(availableMeetingsAlertContainer, document.getElementById("availableMeetingsTable"), document.getElementById("availableMeetingsTableBody"));
            myMeetings = new MyMeetings(myMeetingsAlertContainer, document.getElementById("myMeetingsTable"), document.getElementById("myMeetingsTableBody"));

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
        }
    }
})();