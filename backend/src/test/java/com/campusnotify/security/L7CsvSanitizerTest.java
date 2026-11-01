package com.campusnotify.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class L7CsvSanitizerTest {

    private CsvSanitizer csvSanitizer;

    @BeforeEach
    void setUp() {
        csvSanitizer = new CsvSanitizer();
    }

    @Test
    void testFormulaTriggerNeutralization() {
        // Trigger characters: =, +, -, @, \t, \r, |, %
        assertEquals("'=cmd|'/C calc'!A0", csvSanitizer.sanitizeField("=cmd|'/C calc'!A0"));
        assertEquals("'+SUM(A1:A10)", csvSanitizer.sanitizeField("+SUM(A1:A10)"));
        assertEquals("'-25+4", csvSanitizer.sanitizeField("-25+4"));
        assertEquals("'@SUM(1,2)", csvSanitizer.sanitizeField("@SUM(1,2)"));
        assertEquals("'\tTabExploit", csvSanitizer.sanitizeField("\tTabExploit"));
        assertEquals("'%TOTAL", csvSanitizer.sanitizeField("%TOTAL"));
        assertEquals("'|PIPE_CMD", csvSanitizer.sanitizeField("|PIPE_CMD"));
    }

    @Test
    void testBenignTextRemainsUnchanged() {
        assertEquals("Rohit Sharma", csvSanitizer.sanitizeField("Rohit Sharma"));
        assertEquals("VU4F2526072", csvSanitizer.sanitizeField("VU4F2526072"));
        assertEquals("78.50", csvSanitizer.sanitizeField("78.50"));
        assertEquals("", csvSanitizer.sanitizeField(""));
        assertEquals("", csvSanitizer.sanitizeField(null));
    }

    @Test
    void testRfc4180QuotingAndEscaping() {
        // Commas require surrounding quotes
        assertEquals("\"Sharma, Rohit\"", csvSanitizer.sanitizeAndEscapeField("Sharma, Rohit"));

        // Double quotes inside require doubling
        assertEquals("\"Said \"\"Hello\"\" to class\"", csvSanitizer.sanitizeAndEscapeField("Said \"Hello\" to class"));

        // Newline requires surrounding quotes
        assertEquals("\"Line 1\nLine 2\"", csvSanitizer.sanitizeAndEscapeField("Line 1\nLine 2"));

        // Formula + comma combination
        assertEquals("\"'=SUM(A1,B1)\"", csvSanitizer.sanitizeAndEscapeField("=SUM(A1,B1)"));
    }

    @Test
    void testToCsvLineSerialization() {
        List<String> row = List.of(
                "VU4F2526072",
                "Sharma, Rohit",
                "=HYPERLINK(\"http://evil.com\")",
                "10/10"
        );

        String csvLine = csvSanitizer.toCsvLine(row);
        assertEquals("VU4F2526072,\"Sharma, Rohit\",\"'=HYPERLINK(\"\"http://evil.com\"\")\",10/10", csvLine);
    }
}
