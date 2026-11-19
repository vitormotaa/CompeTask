package io.ionic.starter;

import static org.junit.Assert.*;

import android.content.SharedPreferences;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.Test;

public class EntregasLembreteTest {
    private static SharedPreferences memoria(Map<String, Object> dados) {
        return (SharedPreferences) Proxy.newProxyInstance(
                SharedPreferences.class.getClassLoader(), new Class<?>[] { SharedPreferences.class },
                (proxy, metodo, args) -> {
                    switch (metodo.getName()) {
                        case "getString": return dados.getOrDefault(args[0], args[1]);
                        case "getAll": return new HashMap<>(dados);
                        case "contains": return dados.containsKey(args[0]);
                        case "edit":
                            Map<String, Object> atualizacoes = new HashMap<>();
                            return Proxy.newProxyInstance(
                                    SharedPreferences.Editor.class.getClassLoader(),
                                    new Class<?>[] { SharedPreferences.Editor.class },
                                    (editor, operacao, valores) -> {
                                        switch (operacao.getName()) {
                                            case "putString": atualizacoes.put((String) valores[0], valores[1]); return editor;
                                            case "remove": atualizacoes.put((String) valores[0], null); return editor;
                                            case "commit":
                                            case "apply":
                                                atualizacoes.forEach((chave, valor) -> {
                                                    if (valor == null) dados.remove(chave);
                                                    else dados.put(chave, valor);
                                                });
                                                return operacao.getReturnType() == boolean.class ? true : null;
                                            default: throw new UnsupportedOperationException(operacao.getName());
                                        }
                                    });
                        default: throw new UnsupportedOperationException(metodo.getName());
                    }
                });
    }

    @Test
    public void ignoraOutroUsuarioEUmLembreteLocalJaReservado() {
        Map<String, Object> dados = new HashMap<>();
        dados.put("usuario", "1");
        dados.put("1|5|2026-11-20T10:30:00", "local:" + (System.currentTimeMillis() + 60000));
        SharedPreferences store = memoria(dados);
        assertFalse(EntregasLembrete.receber(store, "2", "5", "2026-11-20T10:30:00"));
        assertFalse(EntregasLembrete.receber(store, "1", "5", "2026-11-20T10:30:00"));
        assertTrue(EntregasLembrete.receber(store, "1", "6", "2026-11-20T10:30:00"));
        assertFalse(EntregasLembrete.receber(store, "1", "6", "2026-11-20T10:30:00"));
    }

    @Test
    public void apenasUmaEntregaConcorrenteEhAceita() throws Exception {
        Map<String, Object> dados = new HashMap<>();
        dados.put("usuario", "1");
        SharedPreferences store = memoria(dados);
        var executor = Executors.newFixedThreadPool(8);
        var inicio = new CountDownLatch(1);
        var aceitas = new AtomicInteger();
        try {
            for (int i = 0; i < 8; i++) {
                executor.submit(() -> {
                    inicio.await();
                    if (EntregasLembrete.receber(store, "1", "5", "2026-11-20T10:30:00")) aceitas.incrementAndGet();
                    return null;
                });
            }
            inicio.countDown();
            executor.shutdown();
            assertTrue(executor.awaitTermination(5, TimeUnit.SECONDS));
            assertEquals(1, aceitas.get());
        } finally {
            executor.shutdownNow();
        }
    }
}
