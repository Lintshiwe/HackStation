package com.hackathon.controllers;

import com.hackathon.convex.ConvexClient;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.ListView;
import javafx.scene.control.Tab;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.stage.Stage;

public class ChatController {

    @FXML private Tab communityTab;
    @FXML private Tab teamTab;
    @FXML private ListView<String> messageList;
    @FXML private TextField messageInput;

    private final ConvexClient convex;

    public ChatController() {
        String convexUrl = System.getenv().getOrDefault("CONVEX_URL", "http://localhost:8000");
        this.convex = new ConvexClient(convexUrl);
    }

    @FXML
    private void initialize() {
        messageInput.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.ENTER) {
                handleSend();
            }
        });
        loadMessages();
    }

    private void loadMessages() {
        try {
            String data = convex.query("messages.list", null);
            messageList.getItems().add(data);
        } catch (Exception e) {
            messageList.getItems().add("Failed to load messages: " + e.getMessage());
        }
    }

    @FXML
    private void handleSend() {
        String text = messageInput.getText().trim();
        if (text.isEmpty()) return;

        try {
            var args = new java.util.HashMap<String, Object>();
            args.put("content", text);
            convex.mutation("messages.send", args);
            messageList.getItems().add("You: " + text);
            messageInput.clear();
        } catch (Exception e) {
            messageList.getItems().add("Send failed: " + e.getMessage());
        }
    }

    @FXML
    private void handleSendButton() {
        handleSend();
    }

    @FXML
    private void goToDashboard() throws Exception {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/dashboard.fxml"));
        Scene scene = new Scene(loader.load(), 1024, 768);
        Stage stage = (Stage) messageInput.getScene().getWindow();
        stage.setScene(scene);
    }
}
