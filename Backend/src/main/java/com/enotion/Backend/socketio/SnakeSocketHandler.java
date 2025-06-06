package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.enums.EventName;
import com.enotion.Backend.payload.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SnakeSocketHandler {
    Map<String, SnakeJoinedVM> activePlayers = new ConcurrentHashMap<>();
    Map<Integer, Boolean> spawnedFoods = new ConcurrentHashMap<>();
    Map<Integer, FoodMV> activeFoods = new ConcurrentHashMap<>();

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
            int foodType = data.foodType();
            String playerId = data.playerId();
            int snakeType = data.snakeType();

            // get snakeType player
            //int playerSnakeType = getPlayerTypeFromId(id);
            boolean isMapping = (snakeType == foodType);
            System.out.println("snakeType: " + snakeType);
            System.out.println("foodType: " + foodType);
            System.out.println("isMapping: " + isMapping);

            // Tạo FoodEatResult và broadcast
            FoodEatenMV foodEatenMV = new FoodEatenMV(playerId, foodType, isMapping);
            server.getBroadcastOperations().sendEvent("FOOD_EATEN", foodEatenMV);

            //server.getBroadcastOperations().sendEvent("FOOD_EATEN", data);
            // remove food
            activeFoods.remove(foodType);
            server.getBroadcastOperations().sendEvent("FOOD_REMOVED", foodType);
            spawnedFoods.put(foodType, false);
            // Respawn after 0.5s
            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
            scheduler.schedule(() -> {
                if(!spawnedFoods.getOrDefault(foodType, false)){
                    float x = (float)(Math.random() * 600 - 300);
                    float y = (float)(Math.random() * 400 - 200);
                    FoodMV newFood = new FoodMV(playerId, foodType, snakeType, x, y);
                    server.getBroadcastOperations().sendEvent("SPAWN_FOOD", newFood);
                    spawnedFoods.put(foodType, true);
                    activeFoods.put(foodType, newFood);
                }
            }, 1500, TimeUnit.MILLISECONDS);
        };
    }

    private DataListener<SnakeVM> handleMove(SocketIOServer server) {
        return (client, data, ackSender) -> {
            // send pos to other clients
            server.getBroadcastOperations().sendEvent(EventName.SNAKE_MOVED.name(), data);
        };
    }

    private DataListener<JoinGameVM> handleJoinGame(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String playerId = data.playerId();

            List<Integer> availableTypes = List.of(0, 1, 2); // RED, GREEN, BLUE
            Set<Integer> usedTypes = activePlayers.values().stream()
                    .map(SnakeJoinedVM::snakeType)
                    .collect(Collectors.toSet());

            int assignedType = availableTypes.stream()
                    .filter(type -> !usedTypes.contains(type))
                    .findFirst()
                    .orElse(0); // fallback if more than 3 players

            SnakeJoinedVM joined = new SnakeJoinedVM(playerId,
                    (float)(Math.random() * 500 - 250),
                    (float)(Math.random() * 500 - 250),
                    0,
                    assignedType);
            System.out.println(playerId + " joined");
            // send own client to spawn
            client.sendEvent("PLAYER_CREATED", joined);

            // send to new client current player list
            for (SnakeJoinedVM other : activePlayers.values()) {
                client.sendEvent("NEW_PLAYER_JOINED", other);
            }

            // send cur food list to other client
            for (FoodMV food : activeFoods.values()) {
                client.sendEvent("SPAWN_FOOD", food);
            }

            // save client joined to list
            activePlayers.put(playerId, joined);

            // emit others client has new client
            server.getBroadcastOperations().sendEvent("NEW_PLAYER_JOINED", joined);

            // spawn food
            // First player -> spawn 3 type food
            if (activePlayers.size() == 1 && activeFoods.isEmpty()) {
                System.out.println("Has active player");
                spawnInitialFoods(server, playerId);
            }
        };
    }

    private int getPlayerTypeFromId(String playerId) {
        SnakeJoinedVM player = activePlayers.get(playerId);
        if (player != null) return player.snakeType();
        return -1;
    }

    private void spawnInitialFoods(SocketIOServer server, String playerId) {
        activeFoods.clear();
        spawnedFoods.clear();

        for (int type = 0; type < 3; type++) {
            float x = (float) (Math.random() * 1000 - 500);
            float y = (float) (Math.random() * 1000 - 500);

            FoodMV food = new FoodMV(playerId, type, 0, x, y);
            System.out.println("type: " + type);
            activeFoods.put(type, food);
            spawnedFoods.put(type, true);

            server.getBroadcastOperations().sendEvent("SPAWN_FOOD", food);
        }
    }
}
