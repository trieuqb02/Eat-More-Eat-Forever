package com.enotion.Backend.payload;


import lombok.Data;


@Data
public class PlayerSession {
    private String playerId;
    private String roomId;
    private String socketId;
    private boolean isOnline;
    private long lastSeen;
    private GameState gameState;

    public PlayerSession(String playerId, String socketId, String roomId) {
        this.playerId = playerId;
        this.socketId = socketId;
        this.roomId = roomId;
        this.isOnline = true;
        this.lastSeen = System.currentTimeMillis();
        this.gameState = new GameState();
    }

    public void updateGameState(GameState gameState) {
        this.gameState = gameState;
        this.lastSeen = System.currentTimeMillis();
    }

    public void markDisconnected() {
        this.isOnline = false;
        this.lastSeen = System.currentTimeMillis();
    }

    public void markReconnected(String newSocketId) {
        this.socketId = newSocketId;
        this.isOnline = true;
        this.lastSeen = System.currentTimeMillis();
    }
}
