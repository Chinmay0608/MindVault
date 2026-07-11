package journalApp.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotEmpty;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {

    @jakarta.validation.constraints.NotBlank(message = "Username cannot be empty")
    @jakarta.validation.constraints.Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Schema(description = "The user's username")
    private String userName;

    @jakarta.validation.constraints.Email(message = "Invalid email format")
    @jakarta.validation.constraints.NotBlank(message = "Email cannot be empty")
    private String email;

    private boolean sentimentAnalysis;

    @jakarta.validation.constraints.NotBlank(message = "Password cannot be empty")
    @jakarta.validation.constraints.Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
