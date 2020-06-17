package it.polimi.tiw.controller;

import com.google.gson.Gson;
import it.polimi.tiw.beans.User;
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

/**
 * This servlet return the information about the current user, such as id, username and number of tries in current creation process
 */
@WebServlet("/home")
public class Home extends HttpServlet {
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
        Gson gson = new Gson();
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().println(gson.toJson(user));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

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
