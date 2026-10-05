package br.cefetmg.pp_competask.security;

public final class TokenUtils {

    private TokenUtils() {
    }

    public static String extrairBearer(String authorization) {
        if (authorization == null) {
            return null;
        }

        authorization = authorization.trim();

        if (!authorization.startsWith("Bearer ")) {
            return null;
        }

        return authorization.substring(7).trim();
    }
}
