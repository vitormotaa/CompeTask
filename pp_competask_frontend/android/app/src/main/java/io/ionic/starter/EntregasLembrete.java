package io.ionic.starter;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

final class EntregasLembrete {
    private static final String STORE = "competask_entregas";
    private static final String USER = "usuario";
    private static final long RETENCAO = 7L * 24 * 60 * 60 * 1000;

    private EntregasLembrete() {}

    static synchronized void usuario(Context context, String usuario) {
        if (!prefs(context).edit().putString(USER, usuario).commit()) {
            throw new IllegalStateException("Não foi possível registrar o usuário das notificações.");
        }
    }

    static synchronized JSONObject reservar(Context context, String usuario, JSONArray lembretes) throws JSONException {
        SharedPreferences store = prefs(context);
        limparAntigos(store);
        SharedPreferences.Editor editor = store.edit();
        JSONArray permitidos = new JSONArray();
        JSONArray novos = new JSONArray();
        for (int i = 0; i < lembretes.length(); i++) {
            JSONObject item = lembretes.getJSONObject(i);
            String chave = chave(usuario, item.getString("tarefaId"), item.getString("horario"));
            String estado = store.getString(chave, null);
            if (estado != null && estado.startsWith("push:")) continue;
            permitidos.put(chave);
            if (estado == null) {
                editor.putString(chave, "local:" + (item.getLong("instante") + RETENCAO));
                novos.put(chave);
            }
        }
        if (!editor.commit()) throw new IllegalStateException("Não foi possível registrar os lembretes locais.");
        return new JSONObject().put("permitidos", permitidos).put("novos", novos);
    }

    static synchronized void cancelarReservas(Context context, JSONArray chaves) throws JSONException {
        SharedPreferences store = prefs(context);
        SharedPreferences.Editor editor = store.edit();
        for (int i = 0; i < chaves.length(); i++) {
            String chave = chaves.getString(i);
            String estado = store.getString(chave, null);
            if (estado != null && estado.startsWith("local:")) editor.remove(chave);
        }
        if (!editor.commit()) throw new IllegalStateException("Não foi possível cancelar as reservas dos lembretes.");
    }

    static synchronized boolean receber(Context context, String usuario, String tarefa, String horario) {
        return receber(prefs(context), usuario, tarefa, horario);
    }

    static synchronized boolean receber(SharedPreferences store, String usuario, String tarefa, String horario) {
        if (!usuario.equals(store.getString(USER, ""))) return false;
        limparAntigos(store);
        String chave = chave(usuario, tarefa, horario);
        if (store.contains(chave)) return false;
        if (!store.edit().putString(chave, "push:" + (System.currentTimeMillis() + RETENCAO)).commit()) {
            throw new IllegalStateException("Não foi possível registrar a entrega do lembrete.");
        }
        return true;
    }

    private static String chave(String usuario, String tarefa, String horario) {
        return usuario + "|" + tarefa + "|" + horario;
    }

    private static void limparAntigos(SharedPreferences store) {
        SharedPreferences.Editor editor = store.edit();
        long agora = System.currentTimeMillis();
        for (var entry : store.getAll().entrySet()) {
            if (USER.equals(entry.getKey()) || !(entry.getValue() instanceof String)) continue;
            String estado = (String) entry.getValue();
            int separador = estado.indexOf(':');
            if (separador < 0) continue;
            try {
                if (Long.parseLong(estado.substring(separador + 1)) < agora) editor.remove(entry.getKey());
            } catch (NumberFormatException ex) {
                android.util.Log.e("CompeTaskPush", "Registro de entrega inválido.", ex);
            }
        }
        editor.apply();
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(STORE, Context.MODE_PRIVATE);
    }
}
