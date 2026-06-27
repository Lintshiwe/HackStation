package com.hackathon.convex;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.util.Map;

public class ConvexClient {

    private final HttpClient client;
    private final String deploymentUrl;
    private String authToken;

    public ConvexClient(String deploymentUrl) {
        this.deploymentUrl = deploymentUrl;
        this.client = HttpClient.newHttpClient();
    }

    public void setAuthToken(String token) {
        this.authToken = token;
    }

    public String query(String path, Map<String, Object> args) throws Exception {
        return sendRequest("query", path, args);
    }

    public String mutation(String path, Map<String, Object> args) throws Exception {
        return sendRequest("mutation", path, args);
    }

    private String sendRequest(String type, String path, Map<String, Object> args) throws Exception {
        String url = deploymentUrl + "/api/" + type + "/" + path;

        StringBuilder jsonArgs = new StringBuilder("{");
        if (args != null) {
            int i = 0;
            for (Map.Entry<String, Object> entry : args.entrySet()) {
                if (i > 0) jsonArgs.append(",");
                jsonArgs.append("\"").append(entry.getKey()).append("\":");
                Object value = entry.getValue();
                if (value instanceof String) {
                    jsonArgs.append("\"").append(value).append("\"");
                } else {
                    jsonArgs.append(value);
                }
                i++;
            }
        }
        jsonArgs.append("}");

        String body = "{\"args\":" + jsonArgs + "}";

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json");

        if (authToken != null && !authToken.isEmpty()) {
            builder.header("Authorization", "Bearer " + authToken);
        }

        HttpRequest request = builder.POST(BodyPublishers.ofString(body)).build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}
