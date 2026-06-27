package com.hackathon.controllers;

import com.hackathon.convex.ConvexClient;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

public class LoginController {

    @FXML private TextField emailField;
    @FXML private PasswordField passwordField;
    @FXML private Label errorLabel;

    private final ConvexClient convex;

    public LoginController() {
        String convexUrl = System.getenv().getOrDefault("CONVEX_URL", "http://localhost:8000");
        this.convex = new ConvexClient(convexUrl);
    }

    @FXML
    private void handleLogin() {
        String email = emailField.getText().trim();
        String password = passwordField.getText().trim();

        if (email.isEmpty() || password.isEmpty()) {
            errorLabel.setText("Please enter email and password");
            return;
        }

        try {
            var args = new java.util.HashMap<String, Object>();
            args.put("email", email);
            args.put("password", password);
            String result = convex.mutation("auth.login", args);

            convex.setAuthToken(result);

            FXMLLoader loader = new FXMLLoader(getClass().getResource("/dashboard.fxml"));
            Scene scene = new Scene(loader.load(), 1024, 768);
            Stage stage = (Stage) emailField.getScene().getWindow();
            stage.setScene(scene);
        } catch (Exception e) {
            errorLabel.setText("Login failed: " + e.getMessage());
        }
    }
}
