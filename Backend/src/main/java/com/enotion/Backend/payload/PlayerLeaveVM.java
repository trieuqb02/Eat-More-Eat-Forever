package com.enotion.Backend.payload;

import java.util.UUID;

public record PlayerLeaveVM(UUID playerId, UUID roomId) { }
