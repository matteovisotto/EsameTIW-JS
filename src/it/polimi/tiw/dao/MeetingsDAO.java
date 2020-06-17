package it.polimi.tiw.dao;

import it.polimi.tiw.beans.Meeting;
import org.apache.commons.lang3.StringEscapeUtils;

import java.sql.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.NoSuchElementException;

public class MeetingsDAO {
    private Connection con;
    public MeetingsDAO(Connection connection) {
        this.con = connection;
    }

    public ArrayList<Meeting> getCreatedMeetings(int id) throws SQLException, NoSuchElementException {
        String query = "SELECT * FROM meetings WHERE creatorid = ? AND timestamp > NOW()";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setInt(1, id);
            try (ResultSet result = pstatement.executeQuery();) {
                ArrayList<Meeting> meetingList = new ArrayList<>();
                while(result.next()) {
                    Meeting meeting = new Meeting();
                    meeting.setTitle(StringEscapeUtils.unescapeJava(result.getString("title")));
                    meeting.setMaxParticipants(result.getInt("maxParticipants"));
                    meeting.setDateTime(result.getTimestamp("timestamp"));
                    meeting.setDuration(result.getInt("duration"));
                    meetingList.add(meeting);
                }
                return meetingList;
            }

        }
    }

    public ArrayList<Meeting> getInvitedMeetings(int id) throws SQLException, NoSuchElementException {
        String query = "SELECT * FROM meetings JOIN invitations ON meetings.id = invitations.meetingid WHERE userid = ? AND timestamp > NOW()";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setInt(1, id);
            try (ResultSet result = pstatement.executeQuery();) {
                ArrayList<Meeting> meetingList = new ArrayList<>();
                while(result.next()) {
                    Meeting meeting = new Meeting();
                    meeting.setTitle(StringEscapeUtils.unescapeJava(result.getString("title")));
                    meeting.setMaxParticipants(result.getInt("maxParticipants"));
                    meeting.setDateTime(result.getTimestamp("timestamp"));
                    meeting.setDuration(result.getInt("duration"));
                    meetingList.add(meeting);
                }
                return meetingList;
            }

        }
    }

    public void createMeeting(String title, int maxParticipants, Date timestamp, int duration, int creatorId, ArrayList<Integer> invitedUsers) throws SQLException {
        String query = "INSERT INTO meetings (title, maxparticipants, timestamp, duration, creatorid) values (?,?,?,?,?)";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setString(1, StringEscapeUtils.escapeJava(title));
            pstatement.setInt(2, maxParticipants);
            pstatement.setTimestamp(3, new Timestamp(timestamp.getTime()));
            pstatement.setInt(4, duration);
            pstatement.setInt(5, creatorId);
            pstatement.executeUpdate();
        }
        query = "SELECT id FROM meetings WHERE title = ? and maxparticipants = ? and timestamp = ? and duration = ? and creatorid = ?";
        int index;
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setString(1, StringEscapeUtils.escapeJava(title));
            pstatement.setInt(2, maxParticipants);
            pstatement.setTimestamp(3, new Timestamp(timestamp.getTime()));
            pstatement.setInt(4, duration);
            pstatement.setInt(5, creatorId);
            try (ResultSet result = pstatement.executeQuery();) {
                result.next();
                index = result.getInt("id");
            }
        }
        query = "INSERT INTO invitations (meetingid, userid) values (?,?)";
        for (Integer userId : invitedUsers){
            try (PreparedStatement pstatement = con.prepareStatement(query);) {
                pstatement.setInt(1, index);
                pstatement.setInt(2, userId);
                pstatement.executeUpdate();
            }
        }
    }



}
