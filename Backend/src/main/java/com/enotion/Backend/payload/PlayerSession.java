package com.enotion.Backend.payload;

import lombok.Data;

import java.util.UUID;

@Data
public class PlayerSession {
    private String playerId;
    private String roomId;
    private String socketId;
    private GameState gameState;
}
