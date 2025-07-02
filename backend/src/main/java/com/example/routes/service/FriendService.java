package com.example.routes.service;

import com.example.routes.dto.response.FriendInvitationResponse;
import com.example.routes.dto.response.FriendResponse;
import com.example.routes.dto.response.InviteResponse;
import com.example.routes.entity.Friendship;
import com.example.routes.entity.Invite;
import com.example.routes.entity.User;
import com.example.routes.exception.ResourceAlreadyExistsException;
import com.example.routes.exception.ResourceNotFoundException;
import com.example.routes.repository.FriendshipRepository;
import com.example.routes.repository.InviteRepository;
import com.example.routes.repository.UserRepository;
import com.example.routes.security.UserDetailsImpl;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final UserRepository userRepository;
    private final InviteRepository inviteRepository;
    private final FriendshipRepository friendshipRepository;

    @Transactional
    public FriendInvitationResponse sendInvitation(String username) {
        User sender = getCurrentAuthenticatedUser();
        User receiver = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        if (sender.getUserId().equals(receiver.getUserId())) {
            return new FriendInvitationResponse("error", "You cannot send invite to yourself");
        }

        if (inviteRepository.existsByUserFromAndUserTo(sender, receiver)) {
            return new FriendInvitationResponse("error", "Invitation already sent");
        }

        Invite invite = new Invite();
        invite.setUserFrom(sender);
        invite.setUserTo(receiver);
        inviteRepository.save(invite);

        return new FriendInvitationResponse("success", "Invitation sent!");
    }



    private User getCurrentAuthenticatedUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public List<InviteResponse> getReceivedInvites(Long userId) {
        List<Invite> invites = inviteRepository.findAllByUserToId(userId);
        return invites.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private InviteResponse convertToDto(Invite invite) {
        return new InviteResponse(
                invite.getInviteId(),
                invite.getUserFrom().getUserId(),
                invite.getUserFrom().getUsername(),
                invite.getCreatedAt());
    }

    @Transactional
    public void createFriendship(User userFrom, User userTo) {
        if (friendshipRepository.existsBetweenUsers(userFrom, userTo)) {
            throw new ResourceAlreadyExistsException("Friendship already exists");
        }

        Friendship friendship = new Friendship();

        // Упорядочиваем ID для консистентности
        if (userFrom.getUserId() < userTo.getUserId()) {
            friendship.setFirstUser(userFrom);
            friendship.setSecondUser(userTo);
        } else {
            friendship.setFirstUser(userTo);
            friendship.setSecondUser(userFrom);
        }

        friendshipRepository.save(friendship);
    }

    public List<FriendResponse> getFriends(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Здесь должна быть логика получения друзей пользователя
        // Например:
        return friendshipRepository.findByFirstUserOrSecondUser(currentUser, currentUser)
                .stream()
                .map(friendship -> {
                    User friend = friendship.getFirstUser().equals(currentUser)
                            ? friendship.getSecondUser()
                            : friendship.getFirstUser();

                    return new FriendResponse(
                            friend.getUserId(),
                            friend.getUsername(),
                            friend.getEmail()
                    );
                })
                .collect(Collectors.toList());
    }
}
