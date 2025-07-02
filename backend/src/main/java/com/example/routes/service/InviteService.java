package com.example.routes.service;

import com.example.routes.dto.response.FriendInvitationResponse;
import com.example.routes.dto.response.InviteResponse;
import com.example.routes.entity.Invite;
import com.example.routes.entity.User;
import com.example.routes.exception.ResourceNotFoundException;
import com.example.routes.repository.InviteRepository;
import com.example.routes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InviteService {
    private final FriendService friendService;
    private final InviteRepository inviteRepository;
    private final UserRepository userRepository;
    public FriendInvitationResponse acceptInvite(Long inviteId) {
        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));
        User userFrom = userRepository.findById(invite.getUserFrom().getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        User userTo = userRepository.findById(invite.getUserTo().getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        friendService.createFriendship(userFrom, userTo);
        inviteRepository.deleteById(inviteId);

        return new FriendInvitationResponse(
                "success",
                "Invite accepted and friendship created");
    }

    public FriendInvitationResponse declineInvite(Long inviteId) {
        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));
        inviteRepository.deleteById(inviteId);

        return new FriendInvitationResponse(
                "success",
                "Invite declined!");
    }
}
