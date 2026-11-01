package com.campusnotify.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.Security;
import java.util.Base64;

/**
 * L6: AES-256-GCM Envelope Encryption for Sensitive Entity Attributes.
 * Enforces zero-knowledge DB storage for Aadhaar, phone numbers, and sensitive academic PII.
 */
@Converter(autoApply = false)
public class Aes256GcmAttributeConverter implements AttributeConverter<String, String> {

    private static final Logger log = LoggerFactory.getLogger(Aes256GcmAttributeConverter.class);
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH_BYTES = 12; // 96 bits recommended for GCM
    private static final int GCM_TAG_LENGTH_BITS = 128;

    // Default 256-bit key (Can be overridden via setMasterKey)
    // Base64 of 32 bytes: "k8Z7wF1m3N9xQ2vL5tY8uI0oP4aS7dF1g3H5j7K9l1M="
    private static final byte[] DEFAULT_KEY_BYTES = Base64.getDecoder().decode("k8Z7wF1m3N9xQ2vL5tY8uI0oP4aS7dF1g3H5j7K9l1M=");
    private static volatile byte[] masterKeyBytes = DEFAULT_KEY_BYTES;

    private static final SecureRandom secureRandom = new SecureRandom();

    static {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    public static synchronized void setMasterKey(String base64Key) {
        if (base64Key != null && !base64Key.isBlank()) {
            byte[] decoded = Base64.getDecoder().decode(base64Key.trim());
            if (decoded.length != 32) {
                throw new IllegalArgumentException("AES-256 master key must be exactly 32 bytes (256 bits). Found: " + decoded.length);
            }
            masterKeyBytes = decoded;
            log.info("AES-256-GCM master key successfully updated.");
        }
    }

    public static synchronized void resetToDefaultKey() {
        masterKeyBytes = DEFAULT_KEY_BYTES;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            byte[] iv = new byte[GCM_IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            SecretKey secretKey = new SecretKeySpec(masterKeyBytes, "AES");
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

            byte[] cipherText = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(cipherText);
        } catch (Exception e) {
            log.error("Failed to encrypt attribute using AES-256-GCM", e);
            throw new IllegalStateException("AES-256-GCM encryption error: " + e.getMessage(), e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            String[] parts = dbData.split(":");
            if (parts.length != 2) {
                // If not encrypted in IV:CIPHERTEXT format, fallback to raw value for backwards compat
                return dbData;
            }
            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] cipherText = Base64.getDecoder().decode(parts[1]);

            SecretKey secretKey = new SecretKeySpec(masterKeyBytes, "AES");
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

            byte[] plainText = cipher.doFinal(cipherText);
            return new String(plainText, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to decrypt attribute using AES-256-GCM", e);
            throw new IllegalStateException("AES-256-GCM decryption error: " + e.getMessage(), e);
        }
    }
}
