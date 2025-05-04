package com.postapp.postapp.repositories;

import com.postapp.postapp.entities.Like;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
}
