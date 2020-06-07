package it.polimi.tiw.beans;


public class User {
    private int id;
    private String username;
    private Meeting pendingMeeting = null;
    private short numTries = 0;

    public User() {
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public Meeting getPendingMeeting() {
        return pendingMeeting;
    }

    public void setPendingMeeting(Meeting pendingMeeting) {
        this.pendingMeeting = pendingMeeting;
    }

    public short getNumTries() {
        return numTries;
    }

    public void setNumTries(short numTries) {
        this.numTries = numTries;
    }
}
