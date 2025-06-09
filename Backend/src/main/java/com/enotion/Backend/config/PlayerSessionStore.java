package com.enotion.Backend.config;

import com.enotion.Backend.payload.PlayerSession;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PlayerSessionStore {
    private final Map<String, PlayerSession> sessions = new ConcurrentHashMap<>();

    public void add(String playerId, PlayerSession session) {
        sessions.put(playerId, session);
    }

    public PlayerSession get(String playerId) {
        return sessions.get(playerId);
    }

    public void remove(String playerId) {
        sessions.remove(playerId);
    }

    public Map<String, PlayerSession> getAll() {
        return sessions;
    }
}
