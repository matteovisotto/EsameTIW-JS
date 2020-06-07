package it.polimi.tiw.controller;

import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.UserDAO;
import it.polimi.tiw.utils.ConnectionHandler;
import org.apache.commons.lang3.StringEscapeUtils;

import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

@WebServlet("/login")
public class Login extends HttpServlet {

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
        resp.getWriter().println("Invalid action for method GET and path login");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String username = null;
        String password = null;

        username = StringEscapeUtils.escapeJava(req.getParameter("username"));
        password = StringEscapeUtils.escapeJava(req.getParameter("password"));

        if (username == null || password == null || username.isEmpty() || password.isEmpty() ) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().println("Credentials must be not null");
            return;
        }

        UserDAO userDao = new UserDAO(connection);
        User user = null;
        try {
            user = userDao.checkCredentials(username, password);
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().println("Internal server error, retry later");
            return;
        }

        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().println("Incorrect credentials");
        } else {

            req.getSession().setAttribute("user", user);
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().println(username);
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
