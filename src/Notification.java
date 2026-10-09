import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Notification model representing a single campus announcement.
 * Demonstrates Encapsulation and Data Formatting.
 */
public class Notification {
    private int id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String author;
    private Date datePosted;

    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm");

    // Constructor for creating new notifications with current timestamp
    public Notification(int id, String title, String description, String category, String priority, String author) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.author = author;
        this.datePosted = new Date();
    }

    // Constructor for loading existing notification from file with specific date
    public Notification(int id, String title, String description, String category, String priority, String author, Date datePosted) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.author = author;
        this.datePosted = datePosted;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getPriority() {
        return priority;
    }

    public String getAuthor() {
        return author;
    }

    public Date getDatePosted() {
        return datePosted;
    }

    public String getFormattedDate() {
        return DATE_FORMAT.format(datePosted);
    }

    /**
     * Nicely formatted multi-line card for console display
     */
    public String toCardString() {
        String priorityBadge = "[" + priority.toUpperCase() + "]";
        if ("URGENT".equalsIgnoreCase(priority) || "HIGH".equalsIgnoreCase(priority)) {
            priorityBadge = "★ " + priorityBadge;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append(String.format(" #%d | %s | %s | Category: %s\n", id, priorityBadge, getFormattedDate(), category));
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append(String.format(" Title       : %s\n", title));
        sb.append(String.format(" Posted By   : %s\n", author));
        sb.append(String.format(" Description : %s\n", description));
        sb.append("--------------------------------------------------------------------------------\n");
        return sb.toString();
    }

    /**
     * Serializes notification into a single line for simple text file persistence.
     * Format: id|||title|||description|||category|||priority|||author|||timestamp
     */
    public String toFileString() {
        return String.format("%d|||%s|||%s|||%s|||%s|||%s|||%d",
                id,
                title.replace("\n", " "),
                description.replace("\n", " "),
                category,
                priority,
                author,
                datePosted.getTime());
    }

    /**
     * Parses a single line from file back into a Notification instance.
     */
    public static Notification fromFileString(String line) {
        try {
            String[] parts = line.split("\\|\\|\\|");
            if (parts.length >= 7) {
                int id = Integer.parseInt(parts[0]);
                String title = parts[1];
                String description = parts[2];
                String category = parts[3];
                String priority = parts[4];
                String author = parts[5];
                long time = Long.parseLong(parts[6]);
                return new Notification(id, title, description, category, priority, author, new Date(time));
            }
        } catch (Exception e) {
            // Ignore corrupted lines
        }
        return null;
    }

    @Override
    public String toString() {
        return String.format("[%d] %s (%s) - %s", id, title, category, author);
    }
}
