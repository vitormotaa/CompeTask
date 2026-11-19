package br.cefetmg.pp_competask.service;

import java.io.IOException;
import org.springframework.stereotype.Component;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;

@Component
public class FirebaseMessagingProvider {
    private FirebaseMessaging messaging;

    public synchronized FirebaseMessaging obter() throws IOException {
        if (messaging == null) {
            String credenciais = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
            if (credenciais == null || credenciais.isBlank()) {
                throw new IllegalStateException("GOOGLE_APPLICATION_CREDENTIALS não configurada.");
            }
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.getApplicationDefault()).build();
            FirebaseApp app = FirebaseApp.initializeApp(options, "competask-push");
            messaging = FirebaseMessaging.getInstance(app);
        }
        return messaging;
    }
}
