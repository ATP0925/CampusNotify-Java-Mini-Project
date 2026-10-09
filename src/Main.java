import java.util.List;
import java.util.Scanner;

/**
 * Main application class providing an interactive terminal UI for Campus Notify.
 * Demonstrates modular design, control flow, user input handling, and OOP principles.
 */
public class Main {
    private static User currentUser = new User("ADMIN-01", "Pratik Atpadkar", "Admin", "Central Administration", "atpadkarmaruti@gmail.com", true);
    private static NotificationManager manager = new NotificationManager();
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        printWelcomeBanner();

        boolean running = true;
        while (running) {
            printMainMenu();
            System.out.print("Enter your choice (1-9): ");
            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1":
                    handleViewAll();
                    break;
                case "2":
                    handleSearch();
                    break;
                case "3":
                    handleFilterByCategory();
                    break;
                case "4":
                    handleFilterByPriority();
                    break;
                case "5":
                    handlePostNotification();
                    break;
                case "6":
                    handleDeleteNotification();
                    break;
                case "7":
                    manager.displayStatistics();
                    break;
                case "8":
                    handleSwitchUser();
                    break;
                case "9":
                    running = false;
                    System.out.println("\n[✓] All data saved successfully.");
                    System.out.println("Thank you for using Campus Notify. Have a productive day!\n");
                    break;
                default:
                    System.out.println("\n[!] Invalid option. Please choose a number between 1 and 9.\n");
            }
        }
        scanner.close();
    }

    private static void printWelcomeBanner() {
        System.out.println("================================================================================");
        System.out.println("    ____                                       _   _       _   _  __       ");
        System.out.println("   / ___|__ _ _ __ ___  _ __  _   _ ___       | \\ | | ___ | |_(_)/ _|_   _ ");
        System.out.println("  | |   / _` | '_ ` _ \\| '_ \\| | | / __|      |  \\| |/ _ \\| __| | |_| | | |");
        System.out.println("  | |__| (_| | | | | | | |_) | |_| \\__ \\      | |\\  | (_) | |_| |  _| |_| |");
        System.out.println("   \\____\\__,_|_| |_| |_| .__/ \\__,_|___/      |_| \\_|\\___/ \\__|_|_|  \\__, |");
        System.out.println("                       |_|                                           |___/ ");
        System.out.println("            CAMPUS NOTIFY - College Announcement Management System              ");
        System.out.println("                    (Java Console Mini-Project 2026)                          ");
        System.out.println("================================================================================");
    }

    private static void printMainMenu() {
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println(" Active User: " + currentUser);
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println(" [1] View All Announcements");
        System.out.println(" [2] Search Announcements (Title, Description, or Author)");
        System.out.println(" [3] Filter Announcements by Category");
        System.out.println(" [4] Filter Announcements by Priority");
        System.out.println(" [5] Post New Announcement");
        System.out.println(" [6] Delete Announcement");
        System.out.println(" [7] View Summary & Statistics");
        System.out.println(" [8] Switch User Profile (Admin / Faculty / Student)");
        System.out.println(" [9] Exit");
        System.out.println("--------------------------------------------------------------------------------");
    }

    private static void handleViewAll() {
        System.out.println("\n--- ALL CAMPUS ANNOUNCEMENTS ---");
        List<Notification> all = manager.getAllNotifications();
        manager.displayNotifications(all);
    }

    private static void handleSearch() {
        System.out.println("\n--- SEARCH ANNOUNCEMENTS ---");
        System.out.print("Enter search keyword (e.g. 'exam', 'tcs', 'library', 'cricket'): ");
        String query = scanner.nextLine().trim();

        if (query.isEmpty()) {
            System.out.println("[!] Search keyword cannot be blank.");
            return;
        }

        List<Notification> results = manager.searchByKeyword(query);
        manager.displayNotifications(results);
    }

    private static void handleFilterByCategory() {
        System.out.println("\n--- FILTER BY CATEGORY ---");
        System.out.println("Available Categories: Examination, Academic, Placement, Event, Sports, General");
        System.out.print("Enter Category name: ");
        String category = scanner.nextLine().trim();

        if (category.isEmpty()) {
            System.out.println("[!] Category cannot be blank.");
            return;
        }

        List<Notification> results = manager.filterByCategory(category);
        manager.displayNotifications(results);
    }

    private static void handleFilterByPriority() {
        System.out.println("\n--- FILTER BY PRIORITY ---");
        System.out.println("Available Priorities: Urgent, High, Medium, Low");
        System.out.print("Enter Priority: ");
        String priority = scanner.nextLine().trim();

        if (priority.isEmpty()) {
            System.out.println("[!] Priority cannot be blank.");
            return;
        }

        List<Notification> results = manager.filterByPriority(priority);
        manager.displayNotifications(results);
    }

    private static void handlePostNotification() {
        System.out.println("\n--- POST NEW ANNOUNCEMENT ---");

        if (!currentUser.canPostNotices()) {
            System.out.println("[!] Authority Restriction: You do not have circular issuing authority.");
            System.out.println("    Only Super Admin (Pratik Atpadkar) or users granted publishing authority can post announcements.");
            System.out.println("    Current profile: " + currentUser);
            return;
        }

        System.out.print("Enter Title: ");
        String title = scanner.nextLine().trim();
        if (title.isEmpty()) {
            System.out.println("[!] Title cannot be empty.");
            return;
        }

        System.out.print("Enter Description: ");
        String description = scanner.nextLine().trim();
        if (description.isEmpty()) {
            System.out.println("[!] Description cannot be empty.");
            return;
        }

        System.out.println("Select Category:");
        System.out.println("  1. Examination  2. Academic  3. Placement");
        System.out.println("  4. Event        5. Sports    6. General");
        System.out.print("Choose (1-6) [default: General]: ");
        String catChoice = scanner.nextLine().trim();
        String category = "General";
        switch (catChoice) {
            case "1": category = "Examination"; break;
            case "2": category = "Academic"; break;
            case "3": category = "Placement"; break;
            case "4": category = "Event"; break;
            case "5": category = "Sports"; break;
            default:  category = "General"; break;
        }

        System.out.println("Select Priority Level:");
        System.out.println("  1. Urgent  2. High  3. Medium  4. Low");
        System.out.print("Choose (1-4) [default: Medium]: ");
        String prioChoice = scanner.nextLine().trim();
        String priority = "Medium";
        switch (prioChoice) {
            case "1": priority = "Urgent"; break;
            case "2": priority = "High"; break;
            case "3": priority = "Medium"; break;
            case "4": priority = "Low"; break;
            default:  priority = "Medium"; break;
        }

        String author = currentUser.getName() + " (" + currentUser.getRole() + ")";
        boolean success = manager.addNotification(title, description, category, priority, author);
        if (success) {
            System.out.println("\n[✓] Announcement posted successfully and saved to disk!\n");
        } else {
            System.out.println("\n[!] Failed to post announcement. Please check your inputs.\n");
        }
    }

    private static void handleDeleteNotification() {
        System.out.println("\n--- DELETE ANNOUNCEMENT ---");
        if (!"Admin".equalsIgnoreCase(currentUser.getRole())) {
            System.out.println("[!] Authority Restriction: Only Super Admin (Pratik Atpadkar) has authority to delete campus announcements.");
            System.out.println("    Current role: " + currentUser.getRole() + " (Use option 8 to switch role if needed).");
            return;
        }

        System.out.print("Enter Notification ID to delete: ");
        String input = scanner.nextLine().trim();
        try {
            int id = Integer.parseInt(input);
            System.out.print("Are you sure you want to delete notification #" + id + "? (y/n): ");
            String confirm = scanner.nextLine().trim();
            if (confirm.equalsIgnoreCase("y")) {
                if (manager.deleteNotification(id)) {
                    System.out.println("\n[✓] Notification #" + id + " deleted successfully.\n");
                } else {
                    System.out.println("\n[!] Notification with ID #" + id + " not found.\n");
                }
            } else {
                System.out.println("Deletion cancelled.");
            }
        } catch (NumberFormatException e) {
            System.out.println("[!] Invalid ID number.");
        }
    }

    private static void handleSwitchUser() {
        System.out.println("\n--- SWITCH USER PROFILE ---");
        System.out.println("Select Role:");
        System.out.println("  1. Super Admin (Pratik Atpadkar - Central Notice Controller)");
        System.out.println("  2. Authorized Faculty Member (Notice Publishing Authority)");
        System.out.println("  3. Student / Viewer (Read-only Announcements & Discussions)");
        System.out.print("Choose role (1-3): ");
        String roleChoice = scanner.nextLine().trim();

        if ("1".equals(roleChoice)) {
            currentUser = new User("ADMIN-01", "Pratik Atpadkar", "Admin", "Central Administration", "atpadkarmaruti@gmail.com", true);
            System.out.println("\n[✓] Switched to Super Admin: " + currentUser + "\n");
            return;
        }

        System.out.print("Enter Your Name: ");
        String name = scanner.nextLine().trim();
        if (name.isEmpty()) {
            name = "Campus Member";
        }

        System.out.print("Enter Department / Branch: ");
        String dept = scanner.nextLine().trim();
        if (dept.isEmpty()) {
            dept = "Computer Science & Engineering";
        }

        switch (roleChoice) {
            case "2":
                System.out.print("Has Super Admin granted notice issuing authority? (y/n) [default: y]: ");
                String authInput = scanner.nextLine().trim();
                boolean canPost = !authInput.equalsIgnoreCase("n");
                currentUser = new User("FAC-" + (int)(Math.random() * 900 + 100), name, "Faculty", dept, name.toLowerCase().replace(" ", "") + "@campus.edu", canPost);
                break;
            case "3":
            default:
                currentUser = new User("STU-" + (int)(Math.random() * 900 + 100), name, "Student", dept, name.toLowerCase().replace(" ", "") + "@campus.edu", false);
                break;
        }

        System.out.println("\n[✓] User profile switched to: " + currentUser + "\n");
    }
}
