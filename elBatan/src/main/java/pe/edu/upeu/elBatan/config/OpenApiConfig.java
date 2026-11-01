package pe.edu.upeu.elBatan.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


//herramienta que te permite configurar y testear todas mis rutas

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI(){
        return new OpenAPI()
                .info(new Info()
                        .title("Api - ElBatan")
                        .version("1.0")
                        .description("Documentacion de las rutas creadas")
                );
    }


}