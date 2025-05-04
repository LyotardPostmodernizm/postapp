package com.postapp.postapp.dto;

import com.postapp.postapp.entities.Comment;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class CommentDTO {
    private Long id;
    private String text;
    private String authorUsername;
    private Long postId;
    private Long parentCommentId;
    private List<CommentDTO> children;
    private Date createdAt;
    private Date updatedAt;



    // Entity → DTO dönüşümü için yardımcı metod
    public static CommentDTO fromEntity(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setText(comment.getText());
        dto.setAuthorUsername(comment.getUser().getUsername());
        dto.setPostId(comment.getPost().getId());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());

        // Üst yorum ID (eğer varsa)
        if (comment.getParent() != null) {
            dto.setParentCommentId(comment.getParent().getId());
        }

        // Alt yorumları recursive olarak DTO'ya çevir
        if (comment.getChildren() != null) {
            dto.setChildren(
                    comment.getChildren()
                            .stream()
                            .map(CommentDTO::fromEntity)
                            .toList()
            );
        }

        return dto;
    }
}
