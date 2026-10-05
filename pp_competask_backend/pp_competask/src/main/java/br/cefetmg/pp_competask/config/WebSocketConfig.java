package br.cefetmg.pp_competask.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import br.cefetmg.pp_competask.security.JwtService;
import br.cefetmg.pp_competask.security.TokenUtils;
import br.cefetmg.pp_competask.security.UsuarioDetailsService;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioDetailsService usuarioDetailsService;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = TokenUtils.extrairBearer(accessor.getFirstNativeHeader("Authorization"));

                    if (token == null || !jwtService.validarToken(token)) {
                        throw new MessageDeliveryException("Token inválido ou ausente.");
                    }

                    try {
                        UserDetails usuario = usuarioDetailsService.loadUserByUsername(jwtService.getEmail(token));
                        if (!usuario.isEnabled()) {
                            throw new MessageDeliveryException("Usuário inativo.");
                        }
                        accessor.setUser(new UsernamePasswordAuthenticationToken(usuario, null,
                                usuario.getAuthorities()));
                    } catch (UsernameNotFoundException ex) {
                        throw new MessageDeliveryException("Usuário não encontrado.");
                    }
                }

                return message;
            }
        });
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topico");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
