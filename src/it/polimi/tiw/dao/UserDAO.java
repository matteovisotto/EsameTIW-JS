package it.polimi.tiw.dao;

import it.polimi.tiw.beans.User;
import it.polimi.tiw.utils.Crypto;
import org.apache.commons.lang3.StringEscapeUtils;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.NoSuchElementException;

public class UserDAO {
    private final Connection con;

    public UserDAO(Connection connection) {
        this.con = connection;
    }

    private String getUserSalt(String username) throws SQLException, NoSuchElementException {
        String query = "SELECT salt FROM user WHERE username = ?";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setString(1, StringEscapeUtils.escapeJava(username));
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) throw new NoSuchElementException();
                else {
                    result.next();
                    return result.getString("salt");
                }
            }

        }
    }
    private String getUserSalt(int userId) throws SQLException, NoSuchElementException {
        String query = "SELECT salt FROM user WHERE id = ?";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setInt(1, userId);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) throw new NoSuchElementException();
                else {
                    result.next();
                    return result.getString("salt");
                }
            }

        }
    }

    public User checkCredentials(String username, String password) throws SQLException, NoSuchElementException {

        String salt = getUserSalt(username);
        String query = "SELECT  * FROM user WHERE username = ? AND password = ?";
        String hash = Crypto.pwHash(password,salt.getBytes(StandardCharsets.UTF_8));
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setString(1, StringEscapeUtils.escapeJava(username));
            pstatement.setString(2, hash);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    throw new NoSuchElementException();
                else {
                    result.next();
                    User user = new User();
                    user.setId(result.getInt("id"));
                    user.setUsername(StringEscapeUtils.unescapeJava(result.getString("username")));
                    return user;
                }
            }
        }
    }

    public User getUser(int userId) throws SQLException, NoSuchElementException {
        String query = "SELECT  * FROM user WHERE id = ?";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setInt(1, userId);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    throw new NoSuchElementException();
                else {
                    result.next();
                    User user = new User();
                    user.setId(result.getInt("id"));
                    user.setUsername(StringEscapeUtils.unescapeJava(result.getString("username")));
                    return user;
                }
            }
        }
    }

    public ArrayList<User> getAllUsers() throws SQLException {
        String query = "SELECT  * FROM user";
        ArrayList<User> list = new ArrayList<>();
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            try (ResultSet result = pstatement.executeQuery();) {
                while (result.next()){
                    User user = new User();
                    user.setId(result.getInt("id"));
                    user.setUsername(StringEscapeUtils.unescapeJava(result.getString("username")));
                    list.add(user);
                }
                return list;
            }
        }
    }

    public void addUser(String username, String password) throws SQLException {
        String query = "INSERT INTO user (username, password, salt) VALUES (?, ?, ?)";
        String salt = Crypto.createSalt();
        String hash = Crypto.pwHash(password,salt.getBytes(StandardCharsets.UTF_8));
        try (PreparedStatement statement = con.prepareStatement(query);){
            statement.setString(1, StringEscapeUtils.escapeJava(username));
            statement.setString(2, hash);
            statement.setString(3, salt);
            statement.executeUpdate();
        }
    }

    public boolean isUsernameFree(String username) throws SQLException {
        String query = "SELECT 1 FROM user WHERE username= ?";
        try (PreparedStatement pstatement = con.prepareStatement(query);) {
            pstatement.setString(1, StringEscapeUtils.escapeJava(username));
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    return true;
                return false;
            }
        }
    }

}

