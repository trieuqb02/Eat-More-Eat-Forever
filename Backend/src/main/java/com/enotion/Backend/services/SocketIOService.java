package com.enotion.Backend.services;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.enotion.Backend.config.PlayerSessionStore;
import com.enotion.Backend.entities.Room;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.enums.RoomState;
import com.enotion.Backend.payload.PlayerSession;
import com.enotion.Backend.repositories.RoomPlayerRepository;
import com.enotion.Backend.repositories.RoomRepository;
import com.enotion.Backend.utils.GameStateUtils;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Component
public class SocketIOService {

    private final SocketIOServer server;

    private final PlayerSessionStore playerSessionStore;

    private final RoomPlayerService roomPlayerService;

    private final RoomPlayerRepository roomPlayerRepository;

    private final RoomRepository roomRepository;

    public SocketIOService(SocketIOServer server, PlayerSessionStore playerSessionStore, RoomPlayerService roomPlayerService,
                           RoomPlayerRepository roomPlayerRepository,RoomRepository roomRepository) {
        this.playerSessionStore = playerSessionStore;
        this.roomPlayerService = roomPlayerService;
        this.roomPlayerRepository = roomPlayerRepository;
        this.roomRepository = roomRepository;
        this.server = server;
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

            String playerId = "";
            for (PlayerSession playerSession : playerSessionStore.getAll().values()) {
                if (playerSession.getSocketId().equals(client.getSessionId().toString())) {
                    playerId = playerSession.getPlayerId();
                    String roomId = playerSession.getRoomId();

                    String gameState = GameStateUtils.toJson(playerSession.getGameState());
                    RoomPlayer roomPlayer = roomPlayerService.getRoomPlayerByRoomIdAndPlayerId(
                            UUID.fromString(roomId),
                            UUID.fromString(playerId)
                    );

                    roomPlayer.setGameState(gameState);
                    roomPlayer.setLeftAt(LocalDateTime.now());
                    roomPlayerRepository.save(roomPlayer);

                    scheduleCheckingQuitedPlayer(playerId, client);

                    playerSession.markDisconnected();
                    break;
                }
            }

        };
    }

    private void scheduleCheckingQuitedPlayer(String playerId, SocketIOClient client){
        Executors.newSingleThreadScheduledExecutor().schedule(() -> {

            PlayerSession session = playerSessionStore.get(playerId);

            if (session != null && !session.isOnline()) {
                RoomPlayer timedOutPlayer = roomPlayerService.getRoomPlayerByRoomIdAndPlayerId(
                        UUID.fromString(session.getRoomId()),
                        UUID.fromString(session.getPlayerId())
                );

                if(timedOutPlayer.getUrlImage().isEmpty()){
                    timedOutPlayer.setScore(0);
                }
                timedOutPlayer.setReady(!timedOutPlayer.isReady());
                roomPlayerRepository.save(timedOutPlayer);

                Room room = roomRepository.findById(timedOutPlayer.getRoom().getId())
                        .orElseThrow(() -> new IllegalStateException("Room not found"));

                List<RoomPlayer> roomPlayers = roomPlayerRepository.findAllByRoomAndLeftAtIsNull(room);

                if (roomPlayers.isEmpty()) {
                    room.setState(RoomState.CLOSE);
                    roomRepository.save(room);
                } else {
                    handlePlayerTimeout(playerId);
                }

                playerSessionStore.remove(playerId);
            }
        }, 5, TimeUnit.SECONDS);
    }

    private void handlePlayerTimeout(String playerId) {

        System.out.println("Player timeout: " + playerId);

    }

    @PreDestroy
    public void stopSocketServer() {
        server.stop();
    }
}

