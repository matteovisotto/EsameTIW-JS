package it.polimi.tiw.controller;

import com.google.gson.Gson;
import it.polimi.tiw.beans.Meeting;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.MeetingsDAO;
import it.polimi.tiw.utils.ConnectionHandler;

import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 * This servlet return the meetings created by the user logged in
 */
@WebServlet("/home/myMeetings")
public class MyMeetings extends HttpServlet {
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
        User user = (User)req.getSession().getAttribute("user");
        MeetingsDAO meetingsDAO = new MeetingsDAO(connection);
        ArrayList<Meeting> meetings;
        try {
            meetings = meetingsDAO.getCreatedMeetings(user.getId());
        } catch (SQLException throwables) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().println("Internal server error, please try later");
            return;
        }
        Gson gson = new Gson();
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().println(gson.toJson(meetings));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        resp.getWriter().println("Invalid request for method POST in /home/myMeetings");
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
