package io.ionic.starter;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.capacitorjs.plugins.pushnotifications.MessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

public class CompetaskMessagingService extends MessagingService {
    @Override
    public void onMessageReceived(@NonNull RemoteMessage mensagem) {
        Map<String, String> dados = mensagem.getData();
        if (!"lembrete".equals(dados.get("tipo"))) {
            super.onMessageReceived(mensagem);
            return;
        }
        String usuario = dados.get("usuarioId");
        String tarefa = dados.get("tarefaId");
        String horario = dados.get("horario");
        if (usuario == null || tarefa == null || horario == null) {
            Log.e("CompeTaskPush", "Mensagem de lembrete inválida.");
            return;
        }
        try {
            NotificationManagerCompat manager = NotificationManagerCompat.from(this);
            if (!manager.areNotificationsEnabled()) {
                Log.w("CompeTaskPush", "Notificações estão desativadas.");
                return;
            }
            if (!EntregasLembrete.receber(this, usuario, tarefa, horario)) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel canal = new NotificationChannel(
                        "lembretes", "Lembretes de tarefas", NotificationManager.IMPORTANCE_HIGH);
                getSystemService(NotificationManager.class).createNotificationChannel(canal);
            }
            Intent abrir = new Intent(this, MainActivity.class);
            abrir.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            abrir.putExtra("competaskPush", true);
            PendingIntent acao = PendingIntent.getActivity(this, 0, abrir,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            var notificacao = new NotificationCompat.Builder(this, "lembretes")
                    .setSmallIcon(R.drawable.ic_lembrete)
                    .setContentTitle("Lembrete de tarefa")
                    .setContentText("Você tem uma tarefa para realizar.")
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setContentIntent(acao)
                    .build();
            manager.notify("competask-push", (usuario + "|" + tarefa + "|" + horario).hashCode(), notificacao);
        } catch (SecurityException | IllegalStateException ex) {
            Log.e("CompeTaskPush", "Não foi possível exibir o lembrete.", ex);
        }
    }
}
