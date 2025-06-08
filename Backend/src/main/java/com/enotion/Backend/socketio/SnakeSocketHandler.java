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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SnakeSocketHandler {
    Map<String, SnakeJoinedVM> activePlayers = new ConcurrentHashMap<>();
    Map<Integer, Boolean> spawnedFoods = new ConcurrentHashMap<>();
    Map<Integer, FoodMV> activeFoods = new ConcurrentHashMap<>();
    Map<String, ScheduledExecutorService> gameTimers = new ConcurrentHashMap<>();
    Map<String, Integer> roomTimers = new ConcurrentHashMap<>();

    public void registerHandlers(SocketIOServer server) {
        // event, type data receive, callback
        server.addEventListener(EventName.MOVE.name(), SnakeVM.class, handleMove(server));
        server.addEventListener("JOIN_GAME", JoinGameVM.class, handleJoinGame(server));
        server.addEventListener("FOOD_EATEN", FoodMV.class, handleFoodEaten(server));
        server.addEventListener("PLAYER_QUIT", PlayerLeaveVM.class, handlePlayerQuit(server));
        server.addEventListener("SNAKE_DIED", PlayerLeaveVM.class, (client, data, ackSender) -> {
            System.out.println("Player died: " + data.playerId());
            server.getBroadcastOperations().sendEvent("SNAKE_DIED", data);
        });
        server.addEventListener("START_GAMEPLAY", StartGameVM.class, handleStartGame(server));
    }

    private DataListener<StartGameVM> handleStartGame(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String roomId = data.roomId();
            int gameTime = 60;

            // check had
            if (gameTimers.containsKey(roomId)) return;

            System.out.println("Start game room ID: " + roomId);

            roomTimers.put(roomId, gameTime);

            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
            gameTimers.put(roomId, scheduler);

            scheduler.scheduleAtFixedRate(() -> {
                int timer = roomTimers.get(roomId) - 1;

                if (timer >= 0) {
                    System.out.println("Timer: " + timer);
                    roomTimers.put(roomId, timer);
                    server.getRoomOperations(roomId).sendEvent("TIMER_COUNT", timer);
                }

                if (timer <= 0) {
                    scheduler.shutdown();
                    gameTimers.remove(roomId);
                    roomTimers.remove(roomId);

                    server.getRoomOperations(roomId).sendEvent("GAME_OVER");
                }
            }, 1, 1, TimeUnit.SECONDS);
        };
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
            boolean isMapping = (snakeType == foodType);

            int score = isMapping ? 10 : -10;
            // create food
            FoodEatenMV foodEatenMV = new FoodEatenMV(playerId, foodType, isMapping, score);
            server.getBroadcastOperations().sendEvent("FOOD_EATEN", foodEatenMV);

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
            System.out.println("Join game room ID: " + data.roomId());


            SnakeJoinedVM joined = new SnakeJoinedVM(
                    playerId,
                    (float)(Math.random() * 500 - 250),
                    (float)(Math.random() * 500 - 250),
                    0,
                    data.type());
            System.out.println(playerId + " joined");
            // send own client to spawn
            client.sendEvent("PLAYER_CREATED", joined);

            // send cur food list to other client
            for (FoodMV food : activeFoods.values()) {
                client.sendEvent("SPAWN_FOOD", food);
            }

            // save client joined to list
            activePlayers.put(playerId, joined);

            // emit others client has new client
            server.getRoomOperations(String.valueOf(data.roomId())).sendEvent("NEW_PLAYER_JOINED", joined);

            //System.out.println("activePlayers.size(): " + activePlayers.size());
            // spawn food
            // First player -> spawn 3 type food
            if (activeFoods.isEmpty()) {
                System.out.println("Has active player");
                spawnInitialFoods(server, playerId);
            }
        };
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
