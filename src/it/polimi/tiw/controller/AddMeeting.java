package it.polimi.tiw.controller;

import com.google.gson.Gson;
import it.polimi.tiw.beans.Meeting;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.MeetingsDAO;
import it.polimi.tiw.dao.UserDAO;
import it.polimi.tiw.utils.ConnectionHandler;
import it.polimi.tiw.utils.Utility;

import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@WebServlet("/home/addMeeting")
@MultipartConfig
public class AddMeeting  extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private Connection connection = null;


    @Override
    public void init() throws ServletException {
        try{
            connection = ConnectionHandler.getConnection(getServletContext());
        } catch (UnavailableException e){
            e.printStackTrace();
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
       resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
       resp.getWriter().println("No action associated to /home/addMeeting for method GET");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String step = req.getParameter("step");
        if(step==null || step.isEmpty()){
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().println("Invalid parameters");
            return;
        }

        if(step.equals("firstStep")){
            User user = (User) req.getSession().getAttribute("user");
            if(!Utility.paramExists(req, resp, new ArrayList<>(Arrays.asList("meetingName", "meetingDate","meetingTime","meetingDuration","meetingMaxParticipants")))) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().println("Invalid parameters");
                return;
            }

            String name = req.getParameter("meetingName");
            SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
            int duration, maxParticipants;
            try{
                duration = Integer.parseInt(req.getParameter("meetingDuration"));
                maxParticipants = Integer.parseInt(req.getParameter("meetingMaxParticipants"));
                if (duration <= 5 || duration >= (24 * 60) || maxParticipants < 2 || maxParticipants > 500) throw new IllegalArgumentException();
            } catch (Exception e) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().println("Invalid number format");
                return;
            }
            Date date, currentTime = new Date();
            LocalTime time;
            Calendar calendar = Calendar.getInstance();
            try{
                date = simpleDateFormat.parse(req.getParameter("meetingDate"));
                time = LocalTime.parse(req.getParameter("meetingTime"));
                calendar.setTime(date);
                calendar.add(Calendar.HOUR_OF_DAY, time.getHour());
                calendar.add(Calendar.MINUTE, time.getMinute());
                calendar.add(Calendar.SECOND, time.getSecond());
                long milliseconds = (calendar.getTime().getTime() - currentTime.getTime());
                if (milliseconds <= 0) throw new IllegalArgumentException();
            } catch (Exception e){
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().println("Invalid data format");
                return;
            }
            Meeting meeting = new Meeting();
            meeting.setDateTime(calendar.getTime());
            meeting.setDuration(duration);
            meeting.setTitle(name);
            meeting.setMaxParticipants(maxParticipants);
            user.setPendingMeeting(meeting);
            resp.setStatus(HttpServletResponse.SC_OK);
        } else if (step.equals("secondStep")){
            User user = (User) req.getSession().getAttribute("user");
            MeetingsDAO meetingsDAO = new MeetingsDAO(connection);

            Map<String, String[]> parameterMap = req.getParameterMap();
            if(!parameterMap.containsKey("invitations")){
                if (user.getNumTries() >= 3) {
                    user.setNumTries((short)0);
                    user.setPendingMeeting(null);
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().println("Too many requests, the meeting has been canceled");
                    return;
                } else {
                    user.setNumTries((short) (user.getNumTries() + 1));
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().println("No one selected");
                }
                return;
            }
            String[] invitations = req.getParameterValues("invitations");
            ArrayList<Integer> userIds;
            try{
                userIds = Arrays.stream(invitations).distinct().map(Integer::parseInt).collect(Collectors.toCollection(ArrayList::new));
            } catch (Exception e) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            Meeting meeting = user.getPendingMeeting();
            if (meeting == null || userIds.size() >= meeting.getMaxParticipants() || userIds.size() <= 0){
                user.setNumTries((short) (user.getNumTries() + 1));
                if (user.getNumTries() >= 3) {
                    user.setNumTries((short)0);
                    user.setPendingMeeting(null);
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().println("Too many requests, the meeting has been canceled");
                }
                if(meeting!= null && userIds.size() >= meeting.getMaxParticipants()){
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().println("Too much people selected, please delete at least " + (userIds.size()-meeting.getMaxParticipants()+1) + " people");
                }
            }
            else {
                UserDAO userDAO = new UserDAO(connection);
                for (Integer i : userIds) {
                    try {
                        if (!userDAO.existsUser(i)) {
                            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                            resp.getWriter().println("Invalid user selected");
                            return;
                        }
                    } catch (SQLException throwables) {
                        resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        resp.getWriter().println("Internal server error, please try later");
                        return;
                    }

                }
                meeting.setParticipants(userIds);
                try {
                    meetingsDAO.createMeeting(meeting.getTitle(), meeting.getMaxParticipants(), meeting.getDateTime(), meeting.getDuration(), user.getId(), meeting.getParticipants());
                } catch (SQLException throwables) {
                    resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    resp.getWriter().println("Internal server error, please try later");
                    return;
                }
                user.setPendingMeeting(null);
                resp.setStatus(HttpServletResponse.SC_OK);
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().println("Invalid step configuration");
        }
    }

    @Override
    public void destroy() {
        try{
            ConnectionHandler.closeConnection(connection);
        } catch (SQLException e){
            e.printStackTrace();
        }
    }
}
