package io.ionic.starter;

import android.content.Intent;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "LembretePush")
public class LembretePushPlugin extends Plugin {
    @Override
    public void load() {
        super.load();
        notificarAbertura(getActivity().getIntent());
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        notificarAbertura(intent);
    }

    private void notificarAbertura(Intent intent) {
        if (intent != null && intent.getBooleanExtra("competaskPush", false)) {
            intent.removeExtra("competaskPush");
            notifyListeners("abriuLembrete", new JSObject(), true);
        }
    }

    @PluginMethod
    public void definirUsuario(PluginCall call) {
        String usuario = call.getString("usuarioId");
        if (usuario == null) {
            call.reject("Usuário não informado.");
            return;
        }
        try {
            EntregasLembrete.usuario(getContext(), usuario);
            call.resolve();
        } catch (IllegalStateException ex) {
            call.reject("Não foi possível atualizar o usuário das notificações.", ex);
        }
    }

    @PluginMethod
    public void reservar(PluginCall call) {
        String usuario = call.getString("usuarioId");
        JSArray lembretes = call.getArray("lembretes");
        if (usuario == null || lembretes == null) {
            call.reject("Dados dos lembretes não informados.");
            return;
        }
        try {
            JSONObject resultado = EntregasLembrete.reservar(getContext(), usuario, lembretes);
            call.resolve(new JSObject(resultado.toString()));
        } catch (JSONException | IllegalStateException ex) {
            call.reject("Não foi possível reservar os lembretes locais.", ex);
        }
    }

    @PluginMethod
    public void cancelarReservas(PluginCall call) {
        JSArray chaves = call.getArray("chaves");
        if (chaves == null) {
            call.reject("Reservas não informadas.");
            return;
        }
        try {
            EntregasLembrete.cancelarReservas(getContext(), chaves);
            call.resolve();
        } catch (JSONException | IllegalStateException ex) {
            call.reject("Não foi possível cancelar as reservas.", ex);
        }
    }
}
