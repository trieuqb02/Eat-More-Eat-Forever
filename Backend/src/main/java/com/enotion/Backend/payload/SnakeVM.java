package com.enotion.Backend.payload;

import java.util.UUID;

public record SnakeVM(UUID id, float x, float y, float rot, String roomId) {
}


