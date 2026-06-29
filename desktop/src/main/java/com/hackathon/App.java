package com.hackathon;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;

public class App extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/login.fxml"));
        Scene scene = new Scene(loader.load(), 1024, 768);
        primaryStage.setTitle("HackStation");
        primaryStage.getIcons().add(new Image(getClass().getResource("/HacStationLogo.png").toExternalForm()));
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
