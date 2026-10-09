/**
 * User class representing a campus member (Student, Faculty, or Admin).
 * Demonstrates OOP Encapsulation and Data Modeling.
 */
public class User {
    private String id;
    private String name;
    private String role; // "Admin", "Faculty", "Student"
    private String department;

    public User(String id, String name, String role, String department) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.department = department;
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

    public void setRole(String role) {
        this.role = role;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    @Override
    public String toString() {
        return String.format("%s (%s - %s) [ID: %s]", name, role, department, id);
    }
}
