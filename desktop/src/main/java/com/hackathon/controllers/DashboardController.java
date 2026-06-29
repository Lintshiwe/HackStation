package com.hackathon.controllers;

import com.hackathon.convex.ConvexClient;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class DashboardController {

    @FXML private Label timerDisplay;
    @FXML private Label userNameLabel;
    @FXML private Label statsHackathons;
    @FXML private Label statsTeam;
    @FXML private VBox announcementsList;

    private final ConvexClient convex;

    public DashboardController() {
        String convexUrl = System.getenv().getOrDefault("CONVEX_URL", "https://amiable-crocodile-549.convex.cloud");
        this.convex = new ConvexClient(convexUrl);
    }

    @FXML
    private void initialize() {
        loadDashboard();
    }

    private void loadDashboard() {
        try {
            var args = new java.util.HashMap<String, Object>();
            String data = convex.query("dashboard.getStats", args);

            statsHackathons.setText("Active: 1");
            statsTeam.setText("Team: 4");
            announcementsList.getChildren().add(new Label("Welcome to HackStation!"));
        } catch (Exception e) {
            announcementsList.getChildren().add(new Label("Failed to load: " + e.getMessage()));
        }
    }

    @FXML
    private void openChat() throws Exception {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/chat.fxml"));
        Scene scene = new Scene(loader.load(), 1024, 768);
        Stage stage = (Stage) userNameLabel.getScene().getWindow();
        stage.setScene(scene);
    }

    @FXML
    private void openTimer() throws Exception {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/timer.fxml"));
        Scene scene = new Scene(loader.load(), 1024, 768);
        Stage stage = (Stage) userNameLabel.getScene().getWindow();
        stage.setScene(scene);
    }
}
