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
        if (notifications.isEmpty()) {
            seedSampleNotifications();
            saveToFile();
        } else {
            // Set nextId to highest existing ID + 1
            for (Notification n : notifications) {
                if (n.getId() >= nextId) {
                    nextId = n.getId() + 1;
                }
            }
        }
    }

    /**
     * Seed initial sample data so the project has realistic data out-of-the-box.
     */
    private void seedSampleNotifications() {
        addNotificationInternal("End-Semester Examination Time Table Released",
                "The schedule for regular and supplementary end-sem exams (Winter 2026) is posted on the notice board and portal. Check your dates.",
                "Examination", "Urgent", "Exam Cell");

        addNotificationInternal("TCS Campus Recruitment Drive 2026",
                "Tata Consultancy Services is visiting for Campus Placements. Eligible final-year students must register before Friday 5:00 PM.",
                "Placement", "High", "Training & Placement Cell");

        addNotificationInternal("Annual Tech Fest - 'INNOVISION 2026'",
                "Department of Computer Science invites project submissions and hackathon registrations for the 3-day inter-college technical festival.",
                "Event", "Medium", "CS Student Council");

        addNotificationInternal("Library Working Hours Extended",
                "The Central Library and Digital Reading Hall will remain open 24x7 starting next Monday to assist with examination preparation.",
                "Academic", "Medium", "Chief Librarian");

        addNotificationInternal("Inter-College Cricket Tournament Trials",
                "Selection trials for the college cricket team will take place tomorrow at 7:00 AM in the main sports ground. Bring valid college ID.",
                "Sports", "Low", "Director of Physical Education");

        addNotificationInternal("Emergency Maintenance: Campus Wi-Fi",
                "Campus network and Wi-Fi services will undergo scheduled downtime on Saturday from 2:00 AM to 6:00 AM for core switch upgrades.",
                "General", "High", "IT Infrastructure Team");
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
