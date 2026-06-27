package com.hackathon.controllers;

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.util.Duration;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class TimerController {

    @FXML private Label timerDisplay;
    @FXML private ProgressBar phaseProgress;
    @FXML private VBox phaseList;
    @FXML private Button startPauseButton;
    @FXML private Button resetButton;

    private Timeline timeline;
    private int secondsElapsed = 0;
    private boolean running = false;
    private final int totalPhaseSeconds = 3600;

    @FXML
    private void initialize() {
        updateDisplay();
        phaseList.getChildren().add(new Label("Phase 1: Ideation (0:00 - 1:00)"));
        phaseList.getChildren().add(new Label("Phase 2: Building (1:00 - 3:00)"));
        phaseList.getChildren().add(new Label("Phase 3: Polish (3:00 - 4:00)"));
    }

    @FXML
    private void handleStartPause() {
        if (running) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    private void startTimer() {
        running = true;
        startPauseButton.setText("Pause");
        timeline = new Timeline(new KeyFrame(Duration.seconds(1), e -> {
            secondsElapsed++;
            updateDisplay();
        }));
        timeline.setCycleCount(Timeline.INDEFINITE);
        timeline.play();
    }

    private void pauseTimer() {
        running = false;
        startPauseButton.setText("Resume");
        if (timeline != null) {
            timeline.stop();
        }
    }

    @FXML
    private void handleReset() {
        if (timeline != null) {
            timeline.stop();
        }
        running = false;
        secondsElapsed = 0;
        startPauseButton.setText("Start");
        updateDisplay();
    }

    private void updateDisplay() {
        int hours = secondsElapsed / 3600;
        int minutes = (secondsElapsed % 3600) / 60;
        int secs = secondsElapsed % 60;
        timerDisplay.setText(String.format("%02d:%02d:%02d", hours, minutes, secs));
        phaseProgress.setProgress(Math.min(1.0, (double) secondsElapsed / totalPhaseSeconds));
    }

    @FXML
    private void goToDashboard() throws Exception {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/dashboard.fxml"));
        Scene scene = new Scene(loader.load(), 1024, 768);
        Stage stage = (Stage) timerDisplay.getScene().getWindow();
        stage.setScene(scene);
    }

    @FXML
    private void goToChat() throws Exception {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/chat.fxml"));
        Scene scene = new Scene(loader.load(), 1024, 768);
        Stage stage = (Stage) timerDisplay.getScene().getWindow();
        stage.setScene(scene);
    }
}
