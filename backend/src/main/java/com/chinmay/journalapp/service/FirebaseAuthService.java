package com.chinmay.journalapp.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.security.PublicKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Map;

@Service
public class FirebaseAuthService {

    @Value("${firebase.project.id:journal-app-dummy}")
    private String projectId;

    private final RestTemplate restTemplate = new RestTemplate();

    public Claims verifyIdToken(String idToken) throws Exception {
        // 1. Decode header to find 'kid' (Key ID)
        String[] parts = idToken.split("\\.");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid JWT format");
        }
        
        String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Map<?, ?> header = mapper.readValue(headerJson, Map.class);
        String kid = (String) header.get("kid");
        
        if (kid == null) {
            throw new IllegalArgumentException("Key ID (kid) missing from token header");
        }

        // 2. Fetch Firebase X.509 public certificates
        String certUrl = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken-system@system.gserviceaccount.com";
        Map<?, ?> certs = restTemplate.getForObject(certUrl, Map.class);
        if (certs == null || !certs.containsKey(kid)) {
            throw new IllegalArgumentException("Certificate not found for key ID: " + kid);
        }

        String x509CertStr = (String) certs.get(kid);

        // 3. Load Public Key from certificate
        CertificateFactory fact = CertificateFactory.getInstance("X.509");
        ByteArrayInputStream is = new ByteArrayInputStream(x509CertStr.getBytes());
        X509Certificate cert = (X509Certificate) fact.generateCertificate(is);
        PublicKey publicKey = cert.getPublicKey();

        // 4. Verify signature and claims
        Jws<Claims> claimsJws = Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(idToken);

        Claims claims = claimsJws.getPayload();

        // 5. Verify standard Firebase claims
        String expectedIssuer = "https://securetoken.google.com/" + projectId;
        if (!expectedIssuer.equals(claims.getIssuer())) {
            throw new SecurityException("Invalid token issuer. Expected: " + expectedIssuer + ", Got: " + claims.getIssuer());
        }

        if (!projectId.equals(claims.getAudience().iterator().next())) {
            throw new SecurityException("Invalid token audience. Expected: " + projectId + ", Got: " + claims.getAudience());
        }

        return claims;
    }
}



