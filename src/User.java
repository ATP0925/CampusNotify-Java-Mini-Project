/**
 * User class representing a campus member (Student, Faculty, or Admin).
 * Demonstrates OOP Encapsulation and Data Modeling.
 */
public class User {
    private String id;
    private String name;
    private String role; // "Admin", "Faculty", "Student"
    private String department;
    private String email;
    private boolean canPostNotices;

    public User(String id, String name, String role, String department) {
        this(id, name, role, department, "", "Admin".equalsIgnoreCase(role));
    }

    public User(String id, String name, String role, String department, String email, boolean canPostNotices) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.department = department;
        this.email = email;
        this.canPostNotices = canPostNotices;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public String getDepartment() {
        return department;
    }

    public String getEmail() {
        return email;
    }

    public boolean canPostNotices() {
        return canPostNotices || "Admin".equalsIgnoreCase(role);
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCanPostNotices(boolean canPostNotices) {
        this.canPostNotices = canPostNotices;
    }

    @Override
    public String toString() {
        String authorityTag = canPostNotices() ? "Authority: Publisher" : "Authority: Viewer Only";
        return String.format("%s (%s - %s) [ID: %s | %s]", name, role, department, id, authorityTag);
    }
}
