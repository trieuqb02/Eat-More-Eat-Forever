package com.enotion.Backend.payload;

import java.util.UUID;

public record LeaveRoom(UUID id, UUID playerId) {
}
