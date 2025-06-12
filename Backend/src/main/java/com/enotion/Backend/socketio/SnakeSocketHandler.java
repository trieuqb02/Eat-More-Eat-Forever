package com.enotion.Backend.socketio;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.enotion.Backend.config.PlayerSessionStore;
import com.enotion.Backend.entities.Room;
import com.enotion.Backend.entities.RoomPlayer;
import com.enotion.Backend.entities.Vector2;
import com.enotion.Backend.enums.EventName;
import com.enotion.Backend.enums.PowerUpType;
import com.enotion.Backend.enums.RoomState;
import com.enotion.Backend.payload.*;
import com.enotion.Backend.repositories.RoomRepository;
import com.enotion.Backend.services.RoomPlayerService;
import com.enotion.Backend.utils.GameStateUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SnakeSocketHandler {
    Map<Integer, Boolean> spawnedFoods = new ConcurrentHashMap<>();
    Map<Integer, FoodMV> activeFoods = new ConcurrentHashMap<>();
    Map<String, ScheduledExecutorService> gameTimers = new ConcurrentHashMap<>();
    Map<String, Integer> roomTimers = new ConcurrentHashMap<>();
    Map<String, Integer> playerScores = new ConcurrentHashMap<>();
    Map<String, List<Vector2>> roomSpawnPositions = new HashMap<>();
    Map<String, Set<Vector2>> usedSpawnPositions = new HashMap<>();
    Map<String, Vector2> activePowerUpPositions = new HashMap<>();
    Map<String, Set<String>> alivePlayers = new ConcurrentHashMap<>();

    RoomPlayerService roomPlayerService;

    PlayerSessionStore playerSessionStore;
    private final RoomRepository roomRepository;

    int GAME_TIME =  60;
    int AMOUNT_SCORE = 10;
    int SPAWN_FOOD_DURATION = 1500;

    public void registerHandlers(SocketIOServer server) {
        // event, type data receive, callback
        server.addEventListener(EventName.MOVE.name(), SnakeVM.class, handleMove(server));
        server.addEventListener(EventName.JOIN_GAME.name(), JoinGameVM.class, handleJoinGame(server));
        server.addEventListener(EventName.FOOD_EATEN.name(), FoodMV.class, handleFoodEaten(server));
        server.addEventListener(EventName.PLAYER_QUIT.name(), PlayerLeaveVM.class, handlePlayerQuit(server));
        server.addEventListener(EventName.SAVE_SCORE.name(), GameOverMV.class, handleSaveScore(server));
        server.addEventListener(EventName.SNAKE_DIED.name(), PlayerLeaveVM.class, handleSnakeDie(server));
        server.addEventListener(EventName.START_GAMEPLAY.name(), StartGameVM.class, handleStartGame(server));
        server.addEventListener(EventName.REJOIN_GAME.name(), RoomAndPlayerVM.class, handleRejoinGame(server));
        server.addEventListener(EventName.POWER_UP_COLLECTED.name(), PowerUpCollectedVM.class, handlePowerUpCollected(server));
        server.addEventListener(EventName.SEND_SPAWN_POSITIONS.name(), SpawnPositionsVM.class, handleSpawnPosition(server));
    }

    private DataListener<StartGameVM> handleStartGame(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String roomId = data.roomId();
            String playerId = data.playerId();

            spawnPowerUp(server, roomId);

            // check had
            if (gameTimers.containsKey(roomId)) return;

            roomTimers.put(roomId, GAME_TIME);

            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
            gameTimers.put(roomId, scheduler);

            scheduler.scheduleAtFixedRate(() -> {
                int timer = roomTimers.get(roomId) - 1;

                if (timer >= 0) {
                    roomTimers.put(roomId, timer);
                    server.getRoomOperations(roomId).sendEvent(EventName.TIMER_COUNT.name(), timer);
                }

                if (timer <= 0) {
                    scheduler.shutdown();
                    gameTimers.remove(roomId);
                    roomTimers.remove(roomId);
                    server.getRoomOperations(roomId).sendEvent(EventName.GAME_OVER.name());
                }
            }, 1, 1, TimeUnit.SECONDS);
        };
    }

    private DataListener<JoinGameVM> handleJoinGame(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String playerId = data.playerId();
            String roomId = data.roomId();
            float x = 0;
            float y = 0;
            float rot = 0;
            int score = 0;
            SnakeJoinedVM joined = new SnakeJoinedVM(
                    playerId,
                    x,
                    y,
                    rot,
                    score,
                    data.type());

            alivePlayers.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(playerId);

            // send own client to spawn
            client.sendEvent(EventName.PLAYER_CREATED.name(), joined);

            // send cur food list to other client
            for (FoodMV food : activeFoods.values()) {
                client.sendEvent(EventName.SPAWN_FOOD.name(), food);
            }

            GameState gameState = new GameState();
            gameState.setX(x);
            gameState.setY(y);
            gameState.setRot(0);
            gameState.setScore(0);
            gameState.setType(data.type());

            PlayerSession playerSession = new PlayerSession(String.valueOf(data.playerId()), client.getSessionId().toString(), String.valueOf(data.roomId()));
            playerSession.updateGameState(gameState);

            playerSessionStore.add(playerId, playerSession);

            // emit others client has new client
            server.getRoomOperations(String.valueOf(roomId)).sendEvent(EventName.NEW_PLAYER_JOINED.name(), joined);

            // spawn food
            // host -> spawn all food
            if (activeFoods.isEmpty()) {
                spawnInitialFoods(server, playerId, roomId);
            }
        };
    }

    private DataListener<RoomAndPlayerVM> handleRejoinGame(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {
            if (playerSessionStore.get(String.valueOf(data.playerId())) != null) {
                RoomPlayer roomPlayer = roomPlayerService.getRoomPlayerByRoomIdAndPlayerId(data.roomId(), data.playerId());
                GameState gameState = GameStateUtils.fromJson(roomPlayer.getGameState());

                PlayerSession playerSession = playerSessionStore.get(String.valueOf(data.playerId()));
                playerSession.markReconnected(socketIOClient.getSessionId().toString());
                playerSession.updateGameState(gameState);

                socketIOClient.joinRoom(String.valueOf(data.roomId()));

                SnakeVM snakeVM = new SnakeVM(data.playerId(), gameState.getX(), gameState.getY(), gameState.getRot(), playerSession.getRoomId());

                server.getRoomOperations(String.valueOf(data.roomId())).sendEvent(EventName.SNAKE_MOVED.name(), snakeVM);
            } else {
                socketIOClient.sendEvent(EventName.TIMEOUT_CONNECTION.name(), "time out");
            }
        };
    }

    private DataListener<PlayerLeaveVM> handleSnakeDie(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String roomId = String.valueOf(data.roomId());
            String playerId = String.valueOf(data.playerId());
            playerScores.put(playerId, 0);

            server.getRoomOperations(roomId).sendEvent(EventName.SNAKE_DIED.name(), data);

            Set<String> aliveSet = alivePlayers.get(roomId);
            if (aliveSet != null) {
                aliveSet.remove(playerId);

                if (aliveSet.size() <= 1) {
                    ScheduledExecutorService scheduler = gameTimers.get(roomId);
                    if (scheduler != null && !scheduler.isShutdown()) {
                        scheduler.shutdown();
                    }
                    gameTimers.remove(roomId);
                    roomTimers.remove(roomId);
                    alivePlayers.remove(roomId);

                    String winnerId = aliveSet.stream().findFirst().orElse(null);

                    server.getRoomOperations(roomId).sendEvent("GAME_OVER", winnerId);
                }
            }
        };
    }

    private DataListener<SpawnPositionsVM> handleSpawnPosition(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String roomId = data.roomId();
            ArrayNode positions = data.spawnPositions();

            List<Vector2> posList = new ArrayList<>();
            for (JsonNode pos : positions) {
                float x = (float) pos.get("x").asDouble();
                float y = (float) pos.get("y").asDouble();
                posList.add(new Vector2(x, y));
            }
            roomSpawnPositions.put(roomId, posList);
        };
    }

    private DataListener<PowerUpCollectedVM> handlePowerUpCollected(SocketIOServer server) {
        return (client, data, ackSender) -> {
            String playerId = data.playerId();
            String roomId = data.roomId();
            int powerUpType = data.powerUpType();
            int duration = data.duration();

            // Reset old pos
            Vector2 oldPos = activePowerUpPositions.get(roomId);
            if (oldPos != null) {
                Set<Vector2> usedList = usedSpawnPositions.getOrDefault(roomId, new HashSet<>());
                usedList.remove(oldPos);
                usedSpawnPositions.put(roomId, usedList);
                activePowerUpPositions.remove(roomId);
            }

            // remove
            server.getRoomOperations(roomId).sendEvent(EventName.POWER_UP_REMOVED.name(), powerUpType);
            spawnPowerUp(server, roomId);

            PowerUpType type;
            try {
                type = PowerUpType.fromCode(powerUpType);
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid PowerUpType from client");
                return;
            }

            PowerUpType effectToApply = type;
            if (type == PowerUpType.MYSTERY) {
                effectToApply = PowerUpType.getRandomBasicEffect();
            }

            PowerUpEffectMV effectData = new PowerUpEffectMV(playerId, effectToApply.getCode(), duration);
            server.getRoomOperations(roomId).sendEvent(EventName.APPLY_EFFECT.name(), effectData);
        };
    }

    private DataListener<PlayerLeaveVM> handlePlayerQuit(SocketIOServer server) {
        return (client, data, ackSender) -> {

            roomPlayerService.quitGame(data.roomId(), data.playerId());

            client.leaveRoom(String.valueOf(data.roomId()));

            if(server.getRoomOperations(String.valueOf(data.roomId())).getClients().isEmpty()){
                Room room = roomRepository.findById(data.roomId()).orElseThrow();
                room.setState(RoomState.CLOSE);
                roomRepository.save(room);
            }
            server.getRoomOperations(String.valueOf(data.roomId())).sendEvent(EventName.PLAYER_QUIT.name(), data);
        };
    }

    private DataListener<FoodMV> handleFoodEaten(SocketIOServer server) {
        return (client, data, ackSender) -> {
            int foodType = data.foodType();
            String playerId = data.playerId();
            String roomId = data.roomId();
            int snakeType = data.snakeType();

            // get snakeType player
            boolean isMapping = (snakeType == foodType);

            int amountScore = isMapping ? AMOUNT_SCORE : -AMOUNT_SCORE;
            int score = playerScores.getOrDefault(playerId, 0) + amountScore;
            if (score <= 0) {
                score = 0;
            }
            playerScores.put(playerId, score);

            for (PlayerSession playerSession : playerSessionStore.getAll().values()) {
                if (playerSession.getPlayerId().equals(data.playerId())) {
                    GameState gameState = playerSession.getGameState();
                    gameState.setScore(score);
                    playerSession.updateGameState(gameState);
                    break;
                }
            }

            // create food
            FoodEatenMV foodEatenMV = new FoodEatenMV(playerId, foodType, isMapping, score);
            server.getRoomOperations(roomId).sendEvent(EventName.FOOD_EATEN.name(), foodEatenMV);

            // Reset old pos
            FoodMV oldFood = activeFoods.get(foodType);
            if (oldFood != null) {
                Vector2 oldPos = new Vector2(oldFood.x(), oldFood.y());
                Set<Vector2> usedList = usedSpawnPositions.getOrDefault(roomId, new HashSet<>());
                usedList.remove(oldPos);
                usedSpawnPositions.put(roomId, usedList);
            }

            // remove food
            activeFoods.remove(foodType);
            server.getRoomOperations(roomId).sendEvent(EventName.FOOD_REMOVED.name(), foodType);
            spawnedFoods.put(foodType, false);
            // Respawn
            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
            scheduler.schedule(() -> {
                if (!spawnedFoods.getOrDefault(foodType, false)) {
                    List<Vector2> spawnList = roomSpawnPositions.get(roomId);
                    Set<Vector2> usedList = usedSpawnPositions.getOrDefault(roomId, new HashSet<>());
                    Vector2 selected = null;
                    List<Vector2> available = spawnList.stream()
                            .filter(pos -> !usedList.contains(pos))
                            .collect(Collectors.toList());

                    if (!available.isEmpty()) {
                        selected = available.get(new Random().nextInt(available.size()));
                        usedList.add(selected);
                        usedSpawnPositions.put(roomId, usedList);

                        float x = selected.x;
                        float y = selected.y;

                        FoodMV newFood = new FoodMV(playerId, roomId, foodType, snakeType, x, y);
                        server.getRoomOperations(roomId).sendEvent(EventName.SPAWN_FOOD.name(), newFood);
                        spawnedFoods.put(foodType, true);
                        activeFoods.put(foodType, newFood);
                    }
                }
            }, SPAWN_FOOD_DURATION, TimeUnit.MILLISECONDS);
        };
    }

    private DataListener<SnakeVM> handleMove(SocketIOServer server) {
        return (client, data, ackSender) -> {
            for (PlayerSession playerSession : playerSessionStore.getAll().values()) {
                if (playerSession.getPlayerId().equals(data.id().toString())) {
                    GameState gameState = playerSession.getGameState();
                    gameState.setX(data.x());
                    gameState.setY(data.y());
                    playerSession.updateGameState(gameState);
                    break;
                }
            }

            // send pos to other clients
            server.getRoomOperations(data.roomId()).sendEvent(EventName.SNAKE_MOVED.name(), data);
        };
    }

    private DataListener<GameOverMV> handleSaveScore(SocketIOServer server) {
        return (socketIOClient, data, ackSender) -> {
            int score = playerScores.getOrDefault(data.playerId().toString(), 0);
            roomPlayerService.update(data, score);
            playerSessionStore.remove(data.playerId().toString());
            socketIOClient.leaveRoom(data.roomId().toString());
        };
    }

    private void spawnInitialFoods(SocketIOServer server, String playerId, String roomId) {
        activeFoods.clear();
        spawnedFoods.clear();

        for (int type = 0; type < 4; type++) {
            List<Vector2> spawnList = roomSpawnPositions.get(roomId);

            Set<Vector2> usedList = usedSpawnPositions.getOrDefault(roomId, new HashSet<>());

            Vector2 selected = null;
            List<Vector2> available = spawnList.stream()
                    .filter(pos -> !usedList.contains(pos))
                    .collect(Collectors.toList());

            if (!available.isEmpty()) {
                selected = available.get(new Random().nextInt(available.size()));
                usedList.add(selected);
                usedSpawnPositions.put(roomId, usedList);

                float x = selected.x;
                float y = selected.y;

                FoodMV newFood = new FoodMV(playerId, roomId, type, 0, x, y);
                server.getRoomOperations(roomId).sendEvent(EventName.SPAWN_FOOD.name(), newFood);
                spawnedFoods.put(type, true);
                activeFoods.put(type, newFood);
            }
        }
    }

    private void spawnPowerUp(SocketIOServer server, String roomId) {
        int delay = ThreadLocalRandom.current().nextInt(3000, 7000);
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.schedule(() -> {
            List<Vector2> spawnList = roomSpawnPositions.get(roomId);
            Set<Vector2> usedList = usedSpawnPositions.getOrDefault(roomId, new HashSet<>());
            Vector2 selected = null;
            List<Vector2> available = spawnList.stream()
                    .filter(pos -> !usedList.contains(pos))
                    .collect(Collectors.toList());

            if (!available.isEmpty()) {
                selected = available.get(new Random().nextInt(available.size()));
                usedList.add(selected);
                usedSpawnPositions.put(roomId, usedList);
                activePowerUpPositions.put(roomId, selected);
                float x = selected.x;
                float y = selected.y;
                int powerUpType = PowerUpType.MYSTERY.getCode();
                PowerUpMV spawnData = new PowerUpMV(powerUpType, x, y);
                server.getRoomOperations(roomId).sendEvent(EventName.SPAWN_POWER_UP.name(), spawnData);
            }
        }, delay, TimeUnit.MILLISECONDS);
    }
}
