package com.hackathon.controllers;

import com.hackathon.convex.ConvexClient;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import java.util.List;

public class LoginController {

    @FXML private TextField emailField;
    @FXML private PasswordField passwordField;
    @FXML private Label errorLabel;
    @FXML private StackPane rootPane;

    private final ConvexClient convex;

    public LoginController() {
        String convexUrl = System.getenv().getOrDefault("CONVEX_URL", "https://amiable-crocodile-549.convex.cloud");
        this.convex = new ConvexClient(convexUrl);
    }

    @FXML
    private void initialize() {
        // Scattered Favicon background pattern
        Image favicon = new Image(getClass().getResource("/Favicon.png").toExternalForm());
        BackgroundFill fill = new BackgroundFill(
            javafx.scene.paint.Color.web("#F8F9FA"),
            javafx.scene.layout.CornerRadii.EMPTY,
            javafx.geometry.Insets.EMPTY
        );
        BackgroundImage bgImage = new BackgroundImage(
            favicon,
            BackgroundRepeat.REPEAT,
            BackgroundRepeat.REPEAT,
            BackgroundPosition.DEFAULT,
            new BackgroundSize(64, 64, false, false, false, false)
        );
        rootPane.setBackground(new Background(List.of(fill), List.of(bgImage)));
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
            String result = convex.mutation("auth:login", args);

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
