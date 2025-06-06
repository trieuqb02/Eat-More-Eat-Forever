package com.enotion.Backend.payload;

import java.util.UUID;

public record MessageVM(PlayerMV player, UUID roomId, String message) {
}
