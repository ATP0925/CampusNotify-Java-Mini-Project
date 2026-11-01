package com.campusnotify.academic;

import com.campusnotify.academic.dto.NoDuesWorkflowDto;
import com.campusnotify.academic.service.NoDuesDagEngine;
import com.campusnotify.repository.HallTicketRepository;
import com.campusnotify.repository.NoDuesClearanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class NoDuesDagEngineTest {

    @Mock
    private HallTicketRepository hallTicketRepository;

    @Mock
    private NoDuesClearanceRepository noDuesClearanceRepository;

    private NoDuesDagEngine noDuesDagEngine;

    @BeforeEach
    void setUp() {
        noDuesDagEngine = new NoDuesDagEngine(hallTicketRepository, noDuesClearanceRepository);
    }

    @Test
    @DisplayName("F17_T01: Initializes 8 clearance nodes with root nodes in PENDING and downstream LOCKED")
    void testInitiateNoDues() {
        NoDuesWorkflowDto wf = noDuesDagEngine.initiateNoDues("student_dag_1");
        assertEquals(8, wf.getNodes().size());
        assertEquals("PENDING", wf.getNodeStatus().get("LIBRARY"));
        assertEquals("PENDING", wf.getNodeStatus().get("ACCOUNTS"));
        assertEquals("LOCKED", wf.getNodeStatus().get("HOD"));
        assertEquals("LOCKED", wf.getNodeStatus().get("PRINCIPAL"));
        assertFalse(wf.isHallTicketIssued());
    }

    @Test
    @DisplayName("F17_T02: Unlocks downstream HOD node only after all predecessor checkpoints clear")
    void testUnlockDownstreamHodNode() {
        noDuesDagEngine.initiateNoDues("student_dag_2");
        noDuesDagEngine.clearNode("student_dag_2", "LIBRARY", "lib_admin", "TXN1");
        noDuesDagEngine.clearNode("student_dag_2", "ACCOUNTS", "acc_admin", "TXN2");
        noDuesDagEngine.clearNode("student_dag_2", "LAB_103", "lab_tech", "TXN3");
        noDuesDagEngine.clearNode("student_dag_2", "SPORTS", "sports_head", "TXN4");

        // 4 cleared, 1 prerequisite remaining (TRAINING_PLACEMENT)
        NoDuesWorkflowDto wf = noDuesDagEngine.getWorkflow("student_dag_2");
        assertEquals("LOCKED", wf.getNodeStatus().get("HOD"));

        // Clear the last prerequisite
        noDuesDagEngine.clearNode("student_dag_2", "TRAINING_PLACEMENT", "tp_officer", "TXN5");
        wf = noDuesDagEngine.getWorkflow("student_dag_2");
        assertEquals("PENDING", wf.getNodeStatus().get("HOD"), "HOD must unlock once all 5 prerequisites clear");
    }

    @Test
    @DisplayName("F17_T03: Issues cryptographically signed digital hall ticket when terminal node clears")
    void testTerminalClearanceIssuesHallTicket() {
        noDuesDagEngine.initiateNoDues("student_dag_3");
        for (String n : List.of("LIBRARY", "ACCOUNTS", "LAB_103", "SPORTS", "TRAINING_PLACEMENT")) {
            noDuesDagEngine.clearNode("student_dag_3", n, "officer", "TXN");
        }
        noDuesDagEngine.clearNode("student_dag_3", "HOD", "hod_it", "TXN");
        noDuesDagEngine.clearNode("student_dag_3", "EXAM_CELL", "exam_ctrl", "TXN");
        NoDuesWorkflowDto wf = noDuesDagEngine.clearNode("student_dag_3", "PRINCIPAL", "principal", "TXN");

        assertTrue(wf.isHallTicketIssued(), "Hall ticket must be issued on terminal Principal clearance");
        assertNotNull(wf.getHallTicketSignature());
        assertEquals(64, wf.getHallTicketSignature().length(), "SHA-256 signature must be 64 hex characters");
    }

    @Test
    @DisplayName("F17_T04: Rejects clearing an already locked node whose dependencies are unmet")
    void testRejectsClearingLockedNode() {
        noDuesDagEngine.initiateNoDues("student_dag_4");
        assertThrows(IllegalStateException.class, () ->
                noDuesDagEngine.clearNode("student_dag_4", "PRINCIPAL", "admin", "TXN")
        );
    }

    @Test
    @DisplayName("F17_T05: Kahn topological sort detects cycle in clearance graph")
    void testKahnCycleDetection() {
        List<String> nodes = List.of("A", "B", "C");
        List<List<String>> cyclicEdges = List.of(
                List.of("A", "B"),
                List.of("B", "C"),
                List.of("C", "A")
        );
        boolean hasCycle = noDuesDagEngine.detectCycle(nodes, cyclicEdges);
        assertTrue(hasCycle, "Should detect circular dependency");

        List<List<String>> acyclicEdges = List.of(
                List.of("A", "B"),
                List.of("B", "C")
        );
        boolean hasNoCycle = noDuesDagEngine.detectCycle(nodes, acyclicEdges);
        assertFalse(hasNoCycle, "Should confirm acyclic graph");
    }

    @Test
    @DisplayName("F17_B01: 2-node cyclic graph (A -> B, B -> A) detected by Kahn algorithm")
    void test2NodeCycle() {
        assertTrue(noDuesDagEngine.detectCycle(List.of("A", "B"), List.of(List.of("A", "B"), List.of("B", "A"))));
    }

    @Test
    @DisplayName("F17_B02: Self-referential edge (A -> A) detected as cycle")
    void testSelfReferentialCycle() {
        assertTrue(noDuesDagEngine.detectCycle(List.of("A"), List.of(List.of("A", "A"))));
    }

    @Test
    @DisplayName("F17_B03: Disconnected graph with 0 edges is valid acyclic")
    void testDisconnectedGraphAcyclic() {
        assertFalse(noDuesDagEngine.detectCycle(List.of("A", "B", "C"), List.of()));
    }

    @Test
    @DisplayName("F17_B04: Attempting to clear non-existent node throws error")
    void testClearNonExistentNode() {
        noDuesDagEngine.initiateNoDues("s_missing_node");
        assertThrows(IllegalArgumentException.class, () ->
                noDuesDagEngine.clearNode("s_missing_node", "NON_EXISTENT_DEPARTMENT", "admin", "TXN")
        );
    }

    @Test
    @DisplayName("F17_B05: Linear 8-node chain topological sort is acyclic")
    void testLinear8NodeChain() {
        List<String> nodes = List.of("1", "2", "3", "4", "5", "6", "7", "8");
        List<List<String>> edges = List.of(
                List.of("1", "2"), List.of("2", "3"), List.of("3", "4"), List.of("4", "5"),
                List.of("5", "6"), List.of("6", "7"), List.of("7", "8")
        );
        assertFalse(noDuesDagEngine.detectCycle(nodes, edges));
    }
}
