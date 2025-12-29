ackage com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.LoginRequest;
import com.seikyuuressha.lms.dto.request.RegisterRequest;
import com.seikyuuressha.lms.dto.response.AuthResponse;
import com.seikyuuressha.lms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class AuthResolver {

    private final AuthService authService;

    @MutationMapping
    public AuthResponse register(@Argument("input") RegisterRequest input) {
        return authService.register(input);
    }

    @MutationMapping
    public AuthResponse login(@Argument("input") LoginRequest input) {
        return authService.login(input);
    }

    @MutationMapping
    public AuthResponse googleLogin(@Argument String idToken) {
        return authService.googleLogin(idToken);
    }
    
    @MutationMapping
    public Boolean requestPasswordReset(@Argument String email) {
        authService.requestPasswordReset(email);
        return true;
    }
    
    @MutationMapping
    public Boolean resetPassword(@Argument String resetCode, @Argument String newPassword) {
        authService.resetPassword(resetCode, newPassword);
        return true;
    }

    @MutationMapping
    public AuthResponse refreshAccessToken(@Argument String refreshToken) {
        return authService.refreshAccessToken(refreshToken);
    }

    @MutationMapping
    public Boolean logout(@Argument String refreshToken) {
        return authService.logout(refreshToken);
    }
}
