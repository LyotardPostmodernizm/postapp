package com.postapp.postapp.repositories;

import com.postapp.postapp.entities.Like;
import com.postapp.postapp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
}
