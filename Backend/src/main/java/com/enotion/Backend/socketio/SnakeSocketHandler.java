package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.enums.EventName;
import com.enotion.Backend.payload.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SnakeSocketHandler {
    Map<String, SnakeJoinedVM> activePlayers = new ConcurrentHashMap<>();

    public void registerHandlers(SocketIOServer server) {
        // event, type data receive, callback
        server.addEventListener(EventName.MOVE.name(), SnakeVM.class, handleMove(server));
        server.addEventListener("JOIN_GAME", JoinGameVM.class, handleJoinGame(server));
        server.addEventListener("FOOD_EATEN", FoodMV.class, handleFoodEaten(server));
        server.addEventListener("PLAYER_QUIT", PlayerLeaveVM.class, handlePlayerQuit(server));
    }

    private DataListener<PlayerLeaveVM> handlePlayerQuit(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String playerId = data.playerId();
            activePlayers.remove(playerId);
            server.getBroadcastOperations().sendEvent("PLAYER_QUIT", data);
        };
    }

    private DataListener<FoodMV> handleFoodEaten(SocketIOServer server) {
        return (client, data, ackSender) -> {
            int type = data.type();
            System.out.println("Spawn food in server");

            server.getBroadcastOperations().sendEvent("FOOD_EATEN", data);

            // remove food
            server.getBroadcastOperations().sendEvent("FOOD_REMOVED", type);

            // Respawn after 0.5s
            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
            scheduler.schedule(() -> {
                float x = (float)(Math.random() * 600 - 300);
                float y = (float)(Math.random() * 400 - 200);
                FoodMV newFood = new FoodMV(type, x, y);
                server.getBroadcastOperations().sendEvent("SPAWN_FOOD", newFood);
            }, 500, TimeUnit.MILLISECONDS);
        };
    }

    private DataListener<SnakeVM> handleMove(SocketIOServer server) {
        return (client, data, ackSender) -> {
            // send pos to other clients
            server.getBroadcastOperations().sendEvent(EventName.SNAKE_MOVED.name(), data);
            //System.out.println("Rot: " + data.rot());
        };
    }

    private DataListener<JoinGameVM> handleJoinGame(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String playerId = data.playerId();

            SnakeJoinedVM joined = new SnakeJoinedVM(playerId,
                    (float)(Math.random() * 500 - 250),
                    (float)(Math.random() * 500 - 250),
                    0);
            System.out.println(playerId + " joined");
            // send own client to spawn
            client.sendEvent("PLAYER_CREATED", joined);

            // send to new client current player list
            for (SnakeJoinedVM other : activePlayers.values()) {
                client.sendEvent("NEW_PLAYER_JOINED", other);
            }

            // save client joined to list
            activePlayers.put(playerId, joined);

            // emit others client has new client
            client.getNamespace().getBroadcastOperations().sendEvent("NEW_PLAYER_JOINED", joined);
        };
    }
}
