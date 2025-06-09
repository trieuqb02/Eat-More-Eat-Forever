package com.enotion.Backend.payload;

import com.enotion.Backend.enums.SnakeType;

import java.util.UUID;

public record JoinGameVM(String playerId, String roomId, SnakeType type) { }
