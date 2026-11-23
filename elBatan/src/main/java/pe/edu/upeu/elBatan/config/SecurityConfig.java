
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

    // =========================================
    // DEPENDENCIAS
    // =========================================

    private final JwtAuthenticationFilter jwtFilter;

    private final AuthenticationProvider authenticationProvider;

    private final CustomAccessDeniedHandler accessDeniedHandler;

    private final CustomAuthenticationEntryPoint authenticationEntryPoint;

    // =========================================
    // CONSTRUCTOR
    // =========================================

    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter,
            AuthenticationProvider authenticationProvider,
            CustomAccessDeniedHandler accessDeniedHandler,
            CustomAuthenticationEntryPoint authenticationEntryPoint
    ) {
        this.jwtFilter = jwtFilter;
        this.authenticationProvider = authenticationProvider;
        this.accessDeniedHandler = accessDeniedHandler;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    // =========================================
    // CONFIGURACIÓN DE SEGURIDAD
    // =========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // =====================================
                // CONFIGURACIÓN GENERAL
                // =====================================

                .cors(Customizer.withDefaults())

                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // =====================================
                        // ERRORES DEL SERVIDOR
                        // =====================================

                        .dispatcherTypeMatchers(
                                DispatcherType.ERROR
                        ).permitAll()

                        // =====================================
                        // AUTENTICACIÓN PÚBLICA
                        // =====================================

                        .requestMatchers(
                                "/api/v1/auth/**"
                        ).permitAll()

                        // =====================================
                        // IMÁGENES PÚBLICAS
                        // =====================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/images/**"
                        ).permitAll()

                        // =====================================
                        // SWAGGER
                        // =====================================

                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // =====================================
                        // PRODUCTOS: CONSULTA PÚBLICA
                        // =====================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/productos",
                                "/api/v1/productos/**"
                        ).permitAll()

                        // =====================================
                        // PRODUCTOS: SOLO ADMINISTRADOR
                        // =====================================

                        .requestMatchers(
                                "/api/v1/productos",
                                "/api/v1/productos/**"
                        ).hasAuthority("ADMIN")

                        // =====================================
                        // CLIENTE Y REPARTIDOR:
                        // REALIZAR COMPRAS PERSONALES
                        // =====================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/pedidos"
                        ).hasAnyAuthority(
                                "CLIENTE",
                                "REPARTIDOR"
                        )

                        // =====================================
                        // CLIENTE Y REPARTIDOR:
                        // CONSULTAR SUS COMPRAS
                        // =====================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/pedidos/mios"
                        ).hasAnyAuthority(
                                "CLIENTE",
                                "REPARTIDOR"
                        )

                        // =====================================
                        // REPARTIDOR:
                        // CONSULTAR PEDIDOS DISPONIBLES
                        // =====================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/pedidos/disponibles"
                        ).hasAuthority("REPARTIDOR")

                        // =====================================
                        // REPARTIDOR:
                        // CONSULTAR SUS ENTREGAS
                        // =====================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/pedidos/mis-entregas"
                        ).hasAuthority("REPARTIDOR")

                        // =====================================
                        // REPARTIDOR:
                        // TOMAR PEDIDO
                        // =====================================

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/v1/pedidos/*/tomar"
                        ).hasAuthority("REPARTIDOR")

                        // =====================================
                        // REPARTIDOR:
                        // CONFIRMAR ENTREGA
                        // =====================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/pedidos/*/evidencia"
                        ).hasAuthority("REPARTIDOR")

                        // =====================================
                        // ADMINISTRADOR Y REPARTIDOR:
                        // VISUALIZAR EVIDENCIA
                        // =====================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/pedidos/*/evidencia"
                        ).hasAnyAuthority(
                                "ADMIN",
                                "REPARTIDOR"
                        )

                        // =====================================
                        // ADMINISTRADOR:
                        // GESTIÓN GENERAL DE PEDIDOS
                        // =====================================

                        .requestMatchers(
                                "/api/v1/pedidos",
                                "/api/v1/pedidos/**"
                        ).hasAuthority("ADMIN")

                        // =====================================
                        // ADMINISTRADOR:
                        // GESTIÓN DE PERSONAS
                        // =====================================

                        .requestMatchers(
                                "/api/personas/**"
                        ).hasAuthority("ADMIN")

                        // =====================================
                        // ADMINISTRADOR:
                        // GESTIÓN DE USUARIOS Y OTROS
                        // =====================================

                        .requestMatchers(
                                "/api/v1/admin/**"
                        ).hasAuthority("ADMIN")

                        // =====================================
                        // ADMINISTRADOR:
                        // REPORTES
                        // =====================================

                        .requestMatchers(
                                "/api/v1/reportes/**"
                        ).hasAuthority("ADMIN")

                        // =====================================
                        // RESTO DE RUTAS
                        // =====================================

                        .anyRequest().authenticated()

                )

                // =====================================
                // SESIONES JWT
                // =====================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =====================================
                // PROVEEDOR DE AUTENTICACIÓN
                // =====================================

                .authenticationProvider(
                        authenticationProvider
                )

                // =====================================
                // FILTRO JWT
                // =====================================

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                // =====================================
                // MANEJO DE ERRORES DE SEGURIDAD
                // =====================================

                .exceptionHandling(errors -> errors

                        .authenticationEntryPoint(
                                authenticationEntryPoint
                        )

                        .accessDeniedHandler(
                                accessDeniedHandler
                        )
                );

        return http.build();
    }
}
