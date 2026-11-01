package com.campusnotify.security;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * L7: CSV Formula Injection Sanitizer (RFC 4180 Neutralization).
 * Neutralizes formula trigger characters (=, +, -, @, \t, \r, |, %)
 * preventing remote command execution and exfiltration when marks/defaulter lists are exported to Excel.
 */
@Component
public class CsvSanitizer {

    private static final Set<Character> FORMULA_TRIGGERS = Set.of(
            '=', '+', '-', '@', '\t', '\r', '|', '%'
    );

    /**
     * Neutralizes a single cell value. If the trimmed text begins with a dangerous formula trigger,
     * it prepends a single quote (').
     */
    public String sanitizeField(String field) {
        if (field == null || field.isEmpty()) {
            return "";
        }

        // Check if raw first character is a trigger (e.g. \t, \r, =, +, -, @, |, %)
        char rawFirstChar = field.charAt(0);
        if (FORMULA_TRIGGERS.contains(rawFirstChar)) {
            return "'" + field;
        }

        // If it starts with space characters, check if first non-space char is a formula trigger
        int i = 0;
        while (i < field.length() && field.charAt(i) == ' ') {
            i++;
        }
        if (i > 0 && i < field.length() && FORMULA_TRIGGERS.contains(field.charAt(i))) {
            return "'" + field;
        }

        return field;
    }

    /**
     * Sanitizes formula triggers and escapes field according to RFC 4180 standard.
     */
    public String sanitizeAndEscapeField(String field) {
        String sanitized = sanitizeField(field);

        boolean containsSpecial = sanitized.contains(",") || sanitized.contains("\"")
                || sanitized.contains("\n") || sanitized.contains("\r");

        if (containsSpecial) {
            // RFC 4180: Double any internal quotes and wrap in quotes
            sanitized = sanitized.replace("\"", "\"\"");
            return "\"" + sanitized + "\"";
        }
        return sanitized;
    }

    /**
     * Sanitizes an entire row of CSV columns.
     */
    public List<String> sanitizeRow(List<String> columns) {
        if (columns == null) {
            return List.of();
        }
        List<String> sanitizedRow = new ArrayList<>(columns.size());
        for (String col : columns) {
            sanitizedRow.add(sanitizeField(col));
        }
        return sanitizedRow;
    }

    /**
     * Serializes an entire row of columns into an RFC 4180 compliant CSV line.
     */
    public String toCsvLine(List<String> columns) {
        if (columns == null || columns.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < columns.size(); i++) {
            if (i > 0) {
                sb.append(",");
            }
            sb.append(sanitizeAndEscapeField(columns.get(i)));
        }
        return sb.toString();
    }
}
