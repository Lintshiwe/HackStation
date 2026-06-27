package com.hackathon.models;

public record Message(String id, String senderId, String senderName, String content, String timestamp) {
}
