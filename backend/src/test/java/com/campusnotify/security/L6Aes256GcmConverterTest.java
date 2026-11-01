package com.campusnotify.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class L6Aes256GcmConverterTest {

    private Aes256GcmAttributeConverter converter;

    @BeforeEach
    void setUp() {
        converter = new Aes256GcmAttributeConverter();
        Aes256GcmAttributeConverter.resetToDefaultKey();
    }

    @Test
    void testEncryptionAndDecryptionRoundTrip() {
        String sensitivePii = "Aadhaar: 9876-5432-1098; Parent Phone: +91 9820098200";

        String cipherTextWithIv = converter.convertToDatabaseColumn(sensitivePii);
        assertNotNull(cipherTextWithIv);
        assertNotEquals(sensitivePii, cipherTextWithIv);

        // Must follow IV:CIPHERTEXT format
        String[] parts = cipherTextWithIv.split(":");
        assertEquals(2, parts.length, "Encrypted output must contain Base64(IV):Base64(Ciphertext)");

        // Decryption must recover original plaintext
        String decrypted = converter.convertToEntityAttribute(cipherTextWithIv);
        assertEquals(sensitivePii, decrypted);
    }

    @Test
    void testSemanticSecurityDifferentIvPerEncryption() {
        String plaintext = "+91 9876543210";

        String cipher1 = converter.convertToDatabaseColumn(plaintext);
        String cipher2 = converter.convertToDatabaseColumn(plaintext);

        assertNotEquals(cipher1, cipher2, "Encrypting same plaintext twice must yield different ciphertexts due to random 96-bit IV");

        // Both decrypt to same plaintext
        assertEquals(plaintext, converter.convertToEntityAttribute(cipher1));
        assertEquals(plaintext, converter.convertToEntityAttribute(cipher2));
    }

    @Test
    void testNullAndEmptyHandling() {
        assertNull(converter.convertToDatabaseColumn(null));
        assertNull(converter.convertToDatabaseColumn(""));
        assertNull(converter.convertToEntityAttribute(null));
        assertNull(converter.convertToEntityAttribute(""));
    }

    @Test
    void testGcmAuthenticationTagTamperingRejection() {
        String plaintext = "Confidential Salary: 1500000 INR";
        String cipher = converter.convertToDatabaseColumn(plaintext);

        String[] parts = cipher.split(":");
        // Tamper with the ciphertext/tag bytes
        String tamperedCipher = parts[0] + ":" + parts[1].substring(0, parts[1].length() - 4) + "AAAA";

        assertThrows(IllegalStateException.class, () -> {
            converter.convertToEntityAttribute(tamperedCipher);
        }, "Tampering with GCM ciphertext or authentication tag must fail decryption");
    }
}
