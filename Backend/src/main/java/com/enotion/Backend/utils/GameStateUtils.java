package com.enotion.Backend.utils;

import com.enotion.Backend.payload.GameState;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class GameStateUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String toJson(GameState gameState) {
        try {
            return objectMapper.writeValueAsString(gameState);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert GameState to JSON", e);
        }
    }

    public static GameState fromJson(String json) {
        try {
            return objectMapper.readValue(json, GameState.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert JSON to GameState", e);
        }
    }
}
