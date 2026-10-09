import java.io.*;
import java.util.*;

/**
 * NotificationManager handles CRUD operations, searching, filtering,
 * analytics, and persistent storage of campus notifications.
 */
public class NotificationManager {
    private List<Notification> notifications;
    private int nextId;
    private final String dataFilePath = "notifications_data.txt";

    public NotificationManager() {
        this.notifications = new ArrayList<>();
        this.nextId = 1;
        loadFromFile();
        for (Notification n : notifications) {
            if (n.getId() >= nextId) {
                nextId = n.getId() + 1;
            }
        }
    }

    private void addNotificationInternal(String title, String description, String category, String priority, String author) {
        Notification notification = new Notification(nextId++, title, description, category, priority, author);
        notifications.add(notification);
    }

    /**
     * Add a new notification and save.
     */
    public boolean addNotification(String title, String description, String category, String priority, String author) {
        if (title == null || title.trim().isEmpty() || description == null || description.trim().isEmpty()) {
            return false;
        }
        addNotificationInternal(title.trim(), description.trim(), category.trim(), priority.trim(), author.trim());
        saveToFile();
        return true;
    }

    /**
     * Delete notification by ID.
     */
    public boolean deleteNotification(int id) {
        Iterator<Notification> iterator = notifications.iterator();
        while (iterator.hasNext()) {
            Notification n = iterator.next();
            if (n.getId() == id) {
                iterator.remove();
                saveToFile();
                return true;
            }
        }
        return false;
    }

    public List<Notification> getAllNotifications() {
        return new ArrayList<>(notifications);
    }

    /**
     * Search notifications by keyword matching title, description, or author.
     */
    public List<Notification> searchByKeyword(String keyword) {
        List<Notification> results = new ArrayList<>();
        if (keyword == null || keyword.trim().isEmpty()) {
            return results;
        }
        String lowerKeyword = keyword.toLowerCase().trim();
        for (Notification n : notifications) {
            if (n.getTitle().toLowerCase().contains(lowerKeyword) ||
                n.getDescription().toLowerCase().contains(lowerKeyword) ||
                n.getAuthor().toLowerCase().contains(lowerKeyword)) {
                results.add(n);
            }
        }
        return results;
    }

    /**
     * Filter notifications by category.
     */
    public List<Notification> filterByCategory(String category) {
        List<Notification> results = new ArrayList<>();
        for (Notification n : notifications) {
            if (n.getCategory().equalsIgnoreCase(category.trim())) {
                results.add(n);
            }
        }
        return results;
    }

    /**
     * Filter notifications by priority.
     */
    public List<Notification> filterByPriority(String priority) {
        List<Notification> results = new ArrayList<>();
        for (Notification n : notifications) {
            if (n.getPriority().equalsIgnoreCase(priority.trim())) {
                results.add(n);
            }
        }
        return results;
    }

    /**
     * Display a list of notifications using card format.
     */
    public void displayNotifications(List<Notification> list) {
        if (list == null || list.isEmpty()) {
            System.out.println("\n[!] No notifications found matching the criteria.\n");
            return;
        }
        System.out.println(String.format("\nFound %d notification(s):\n", list.size()));
        for (Notification n : list) {
            System.out.print(n.toCardString());
        }
    }

    /**
     * Display statistical breakdown of notifications.
     */
    public void displayStatistics() {
        System.out.println("\n============================================================");
        System.out.println("            CAMPUS NOTIFY - SUMMARY & STATISTICS           ");
        System.out.println("============================================================");
        System.out.println(String.format(" Total Announcements Posted: %d", notifications.size()));

        Map<String, Integer> categoryCounts = new LinkedHashMap<>();
        Map<String, Integer> priorityCounts = new LinkedHashMap<>();

        for (Notification n : notifications) {
            categoryCounts.put(n.getCategory(), categoryCounts.getOrDefault(n.getCategory(), 0) + 1);
            priorityCounts.put(n.getPriority(), priorityCounts.getOrDefault(n.getPriority(), 0) + 1);
        }

        System.out.println("\n Breakup by Category:");
        for (Map.Entry<String, Integer> entry : categoryCounts.entrySet()) {
            System.out.println(String.format("   • %-16s : %d", entry.getKey(), entry.getValue()));
        }

        System.out.println("\n Breakup by Priority Level:");
        for (Map.Entry<String, Integer> entry : priorityCounts.entrySet()) {
            System.out.println(String.format("   • %-16s : %d", entry.getKey(), entry.getValue()));
        }
        System.out.println("============================================================\n");
    }

    /**
     * Save notifications to a persistent file.
     */
    public void saveToFile() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(dataFilePath))) {
            for (Notification n : notifications) {
                writer.println(n.toFileString());
            }
        } catch (IOException e) {
            System.err.println("Warning: Could not save notifications to file: " + e.getMessage());
        }
    }

    /**
     * Load notifications from file.
     */
    public void loadFromFile() {
        File file = new File(dataFilePath);
        if (!file.exists()) {
            return;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.trim().isEmpty()) {
                    Notification n = Notification.fromFileString(line);
                    if (n != null) {
                        notifications.add(n);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Warning: Could not read notifications from file: " + e.getMessage());
        }
    }
}
