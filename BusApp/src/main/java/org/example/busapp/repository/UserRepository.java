package org.example.busapp.repository;

import org.example.busapp.model.User;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public class UserRepository {
    public List<User> findAllUsers() {
        return Arrays.asList(
                new User(1L, "Alice"),
                new User(2L, "Bob")
        );
    }
}
