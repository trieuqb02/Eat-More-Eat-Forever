package com.enotion.Backend.services;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.enotion.Backend.config.PlayerSessionStore;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.payload.PlayerSession;
import com.enotion.Backend.repositories.RoomPlayerRepository;
import com.enotion.Backend.utils.GameStateUtils;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SocketIOService {

    private final SocketIOServer server;

    private final PlayerSessionStore playerSessionStore;

    private final RoomPlayerService roomPlayerService;
    private final RoomPlayerRepository roomPlayerRepository;

    public SocketIOService(SocketIOServer server, PlayerSessionStore playerSessionStore, RoomPlayerService roomPlayerService,
                           RoomPlayerRepository roomPlayerRepository) {
        this.playerSessionStore = playerSessionStore;
        this.roomPlayerService = roomPlayerService;
        this.server = server;
        this.roomPlayerRepository = roomPlayerRepository;
    }

    @PostConstruct
    public void startSocketServer() {
        server.addConnectListener(onConnected());
        server.addDisconnectListener(onDisconnected());
        server.start();
    }

    private ConnectListener onConnected() {
        return (client) -> {
            System.out.println("Socket ID " + client.getSessionId().toString() + " connected to socket");
        };
    }

    private DisconnectListener onDisconnected() {
        return client -> {
            System.out.println("Socket ID " + client.getSessionId().toString() + " disconnected from socket");

            for (PlayerSession playerSession : playerSessionStore.getAll().values()) {
                if (playerSession.getSocketId().equals(client.getSessionId().toString())) {
                    System.out.println("save data");
                    String gameState = GameStateUtils.toJson(playerSession.getGameState());
                    RoomPlayer roomPlayer = roomPlayerService.getRoomPlayerByRoomIdAndPlayerId(UUID.fromString(playerSession.getRoomId()), UUID.fromString(playerSession.getPlayerId()));
                    roomPlayer.setGameState(gameState);
                    roomPlayerRepository.save(roomPlayer);
                    playerSessionStore.remove(playerSession.getPlayerId());
                    break;
                }
            }
        };
    }

    @PreDestroy
    public void stopSocketServer() {
        server.stop();
    }
}

