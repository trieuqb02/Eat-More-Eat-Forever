package com.enotion.Backend.payload;

import java.util.UUID;

public record JoinGameVM(String playerId, UUID roomId) { }
