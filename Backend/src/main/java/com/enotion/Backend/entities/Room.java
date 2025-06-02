package com.enotion.Backend.entities;

import com.enotion.Backend.enums.RoomState;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Room extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    UUID id;

    String name;

    String description;

    @Enumerated(EnumType.STRING)
    RoomState state;

    int maxPlayers = 4;

    @OneToMany(mappedBy = "currentRoom", fetch = FetchType.EAGER)
    private Set<Player> players = new HashSet<>();
}
