package com.enotion.Backend.payload;

public record PowerUpCollectedVM (String playerId, String roomId, int powerUpType, int duration) { }

