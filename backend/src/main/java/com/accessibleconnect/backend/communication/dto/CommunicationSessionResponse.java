package com.accessibleconnect.backend.communication.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class CommunicationSessionResponse {

    private UUID id;
    private UUID creatorUserId;
    private String creatorName;
    private String creatorAccountType;
    private UUID participantUserId;
    private String participantName;
    private String participantAccountType;
    private String mode;
    private String status;
    private String roomCode;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime updatedAt;

    public CommunicationSessionResponse() {}

    public CommunicationSessionResponse(
            UUID id, 
            UUID creatorUserId, 
            String creatorName, 
            String mode, 
            String status, 
            String roomCode, 
            LocalDateTime createdAt, 
            LocalDateTime startedAt, 
            LocalDateTime endedAt, 
            LocalDateTime updatedAt
    ) {
        this(id, creatorUserId, creatorName, null, null, null, null, mode, status, roomCode, createdAt, startedAt, endedAt, updatedAt);
    }

    public CommunicationSessionResponse(
            UUID id, 
            UUID creatorUserId, 
            String creatorName,
            String creatorAccountType,
            UUID participantUserId,
            String participantName,
            String participantAccountType,
            String mode, 
            String status, 
            String roomCode, 
            LocalDateTime createdAt, 
            LocalDateTime startedAt, 
            LocalDateTime endedAt, 
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.creatorUserId = creatorUserId;
        this.creatorName = creatorName;
        this.creatorAccountType = creatorAccountType;
        this.participantUserId = participantUserId;
        this.participantName = participantName;
        this.participantAccountType = participantAccountType;
        this.mode = mode;
        this.status = status;
        this.roomCode = roomCode;
        this.createdAt = createdAt;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCreatorUserId() {
        return creatorUserId;
    }

    public void setCreatorUserId(UUID creatorUserId) {
        this.creatorUserId = creatorUserId;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public String getCreatorAccountType() {
        return creatorAccountType;
    }

    public void setCreatorAccountType(String creatorAccountType) {
        this.creatorAccountType = creatorAccountType;
    }

    public UUID getParticipantUserId() {
        return participantUserId;
    }

    public void setParticipantUserId(UUID participantUserId) {
        this.participantUserId = participantUserId;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public String getParticipantAccountType() {
        return participantAccountType;
    }

    public void setParticipantAccountType(String participantAccountType) {
        this.participantAccountType = participantAccountType;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
