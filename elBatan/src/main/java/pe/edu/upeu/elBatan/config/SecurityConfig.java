package pe.edu.upeu.elBatan.config;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pe.edu.upeu.elBatan.Security.JwtAuthenticationFilter;
import pe.edu.upeu.elBatan.exception.CustomAccessDeniedHandler;
import pe.edu.upeu.elBatan.exception.CustomAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final AuthenticationProvider authenticationProvider;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter,
            AuthenticationProvider authenticationProvider,
            CustomAccessDeniedHandler accessDeniedHandler,
            CustomAuthenticationEntryPoint authenticationEntryPoint) {
        this.jwtFilter = jwtFilter;
        this.authenticationProvider = authenticationProvider;
        this.accessDeniedHandler = accessDeniedHandler;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()

                        // Rutas públicas
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/images/**").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**",
                                "/v3/api-docs/**").permitAll()

                        // Catálogo público y gestión de productos para ADMIN
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/productos", "/api/v1/productos/**").permitAll()
                        .requestMatchers("/api/v1/productos", "/api/v1/productos/**")
                        .hasAuthority("ADMIN")

                        // El cliente crea pedidos y consulta los suyos
                        .requestMatchers(HttpMethod.POST, "/api/v1/pedidos")
                        .hasAuthority("CLIENTE")
                        .requestMatchers(HttpMethod.GET, "/api/v1/pedidos/mios")
                        .hasAuthority("CLIENTE")

                        // El administrador gestiona los pedidos
                        .requestMatchers("/api/v1/pedidos", "/api/v1/pedidos/**")
                        .hasAuthority("ADMIN")
                        .requestMatchers("/api/personas/**").hasAuthority("ADMIN")

                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                );

        return http.build();
    }
}