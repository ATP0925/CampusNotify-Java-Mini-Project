package com.campusnotify.academic;

import com.campusnotify.academic.service.ChaumianFeedbackService;
import com.campusnotify.academic.service.ChaumianFeedbackService.AnonymousFeedbackRecord;
import com.campusnotify.repository.FeedbackSubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigInteger;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ChaumianFeedbackTest {

    @Mock
    private FeedbackSubmissionRepository feedbackSubmissionRepository;

    private ChaumianFeedbackService feedbackService;

    @BeforeEach
    void setUp() {
        feedbackService = new ChaumianFeedbackService(feedbackSubmissionRepository);
    }

    @Test
    @DisplayName("F19_T01: Blinds message hash using random factor r coprime to N")
    void testBlindMessageHash() {
        BigInteger msgHash = new BigInteger("1234");
        BigInteger r = new BigInteger("42"); // random blinding factor
        BigInteger blinded = feedbackService.blindMessage(msgHash, r);
        assertNotEquals(msgHash, blinded, "Blinded message must not match raw hash");
    }

    @Test
    @DisplayName("F19_T02: Registrar signs blinded token blindly using RSA private key")
    void testSignBlindedToken() {
        BigInteger blinded = new BigInteger("567");
        BigInteger blindedSig = feedbackService.signBlindedToken(blinded);
        assertTrue(blindedSig.compareTo(BigInteger.ZERO) > 0);
    }

    @Test
    @DisplayName("F19_T03: Student unblinds signature and mathematical equality s^e = H(m) mod N holds")
    void testUnblindAndMathematicalVerification() {
        BigInteger msgHash = new BigInteger("789");
        BigInteger r = new BigInteger("23"); // gcd(23, 3233) = 1
        BigInteger blinded = feedbackService.blindMessage(msgHash, r);
        BigInteger blindedSig = feedbackService.signBlindedToken(blinded);
        BigInteger unblindedSig = feedbackService.unblindSignature(blindedSig, r);

        boolean isValid = feedbackService.verifyBlindSignature(msgHash, unblindedSig);
        assertTrue(isValid, "Unblinded signature must satisfy s^e = H(m) mod N");
    }

    @Test
    @DisplayName("F19_T04: Registers anonymous feedback without student identity attachment")
    void testSubmitAnonymousFeedback() {
        String tokenUuid = "fb_token_101";
        BigInteger msgHash = new BigInteger("505");
        BigInteger r = new BigInteger("11");
        BigInteger blinded = feedbackService.blindMessage(msgHash, r);
        BigInteger blindedSig = feedbackService.signBlindedToken(blinded);
        BigInteger unblindedSig = feedbackService.unblindSignature(blindedSig, r);

        UUID facultyId = UUID.randomUUID();
        AnonymousFeedbackRecord record = feedbackService.submitAnonymousFeedback(
                tokenUuid, msgHash, unblindedSig, facultyId, 5, "Excellent lecture on OS"
        );

        assertEquals(5, record.getRating());
        assertEquals(facultyId, record.getFacultyId());
        assertEquals("Excellent lecture on OS", record.getComment());
    }

    @Test
    @DisplayName("F19_T05: Prevents double-spending of feedback token")
    void testDoubleSpendingPrevention() {
        String tokenUuid = "fb_token_double";
        BigInteger msgHash = new BigInteger("312");
        BigInteger r = new BigInteger("7");
        BigInteger blinded = feedbackService.blindMessage(msgHash, r);
        BigInteger blindedSig = feedbackService.signBlindedToken(blinded);
        BigInteger unblindedSig = feedbackService.unblindSignature(blindedSig, r);

        UUID facultyId = UUID.randomUUID();
        feedbackService.submitAnonymousFeedback(tokenUuid, msgHash, unblindedSig, facultyId, 4, "Good");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                feedbackService.submitAnonymousFeedback(tokenUuid, msgHash, unblindedSig, facultyId, 1, "Replay attack")
        );
        assertEquals("DOUBLE_SPEND_DETECTED: Token already used", ex.getMessage());
    }

    @Test
    @DisplayName("F19_B01: Trivial blinding factor r = 1 produces message hash mod N")
    void testTrivialBlindingFactor1() {
        BigInteger blinded = feedbackService.blindMessage(new BigInteger("500"), BigInteger.ONE);
        assertEquals(new BigInteger("500"), blinded);
    }

    @Test
    @DisplayName("F19_B02: Message hash at boundary (1) blinds and unblinds cleanly")
    void testBoundaryHash1() {
        BigInteger msg = BigInteger.ONE;
        BigInteger r = new BigInteger("19");
        BigInteger blinded = feedbackService.blindMessage(msg, r);
        BigInteger blindedSig = feedbackService.signBlindedToken(blinded);
        BigInteger unblindedSig = feedbackService.unblindSignature(blindedSig, r);
        assertTrue(feedbackService.verifyBlindSignature(msg, unblindedSig));
    }

    @Test
    @DisplayName("F19_B03: Message hash at boundary (N - 1) blinds and unblinds cleanly")
    void testBoundaryHashNMinus1() {
        BigInteger msg = ChaumianFeedbackService.RSA_N.subtract(BigInteger.ONE);
        BigInteger r = new BigInteger("29");
        BigInteger blinded = feedbackService.blindMessage(msg, r);
        BigInteger blindedSig = feedbackService.signBlindedToken(blinded);
        BigInteger unblindedSig = feedbackService.unblindSignature(blindedSig, r);
        assertTrue(feedbackService.verifyBlindSignature(msg, unblindedSig));
    }

    @Test
    @DisplayName("F19_B04: Tampered signature fails mathematical verification")
    void testTamperedSignatureFails() {
        BigInteger msg = new BigInteger("450");
        BigInteger r = new BigInteger("13");
        BigInteger blinded = feedbackService.blindMessage(msg, r);
        BigInteger blindedSig = feedbackService.signBlindedToken(blinded);
        BigInteger unblindedSig = feedbackService.unblindSignature(blindedSig, r);
        BigInteger corruptedSig = unblindedSig.add(BigInteger.ONE);
        assertFalse(feedbackService.verifyBlindSignature(msg, corruptedSig));
    }

    @Test
    @DisplayName("F19_B05: Rating input clamped to range [1, 5]")
    void testClampedRating() {
        String tokenUuid = "fb_token_clamp";
        BigInteger msgHash = new BigInteger("202");
        BigInteger r = new BigInteger("17");
        // gcd(17, 3233) = 1
        BigInteger blinded = feedbackService.blindMessage(msgHash, r);
        BigInteger blindedSig = feedbackService.signBlindedToken(blinded);
        BigInteger unblindedSig = feedbackService.unblindSignature(blindedSig, r);

        UUID facultyId = UUID.randomUUID();
        AnonymousFeedbackRecord record = feedbackService.submitAnonymousFeedback(
                tokenUuid, msgHash, unblindedSig, facultyId, 10, "Super!"
        );
        assertEquals(5, record.getRating(), "Rating > 5 must be clamped to 5");
    }
}
