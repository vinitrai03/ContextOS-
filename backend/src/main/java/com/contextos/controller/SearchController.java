package com.contextos.controller;

import com.contextos.model.Meeting;
import com.contextos.model.User;
import com.contextos.model.ai.Commitment;
import com.contextos.model.ai.Decision;
import com.contextos.model.ai.MeetingSummary;
import com.contextos.model.ai.Task;
import com.contextos.repository.MeetingRepository;
import com.contextos.repository.UserRepository;
import com.contextos.repository.ai.CommitmentRepository;
import com.contextos.repository.ai.DecisionRepository;
import com.contextos.repository.ai.MeetingSummaryRepository;
import com.contextos.repository.ai.TaskRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SearchController {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final TaskRepository taskRepository;
    private final CommitmentRepository commitmentRepository;
    private final MeetingSummaryRepository summaryRepository;

    @Data
    @Builder
    public static class GraphNode {
        private String id;
        private String label;
        private String type; // USER | MEETING | DECISION | TASK | COMMITMENT
        private Map<String, Object> data;
    }

    @Data
    @Builder
    public static class GraphEdge {
        private String id;
        private String source;
        private String target;
        private String label; // HOSTED | DECIDED | ASSIGNED_TO | COMMITTED_TO
    }

    @Data
    @Builder
    public static class GraphResponse {
        private List<GraphNode> nodes;
        private List<GraphEdge> edges;
    }

    @Data
    public static class SearchRequest {
        private String query;
        private int limit = 5;
    }

    @Data
    @Builder
    public static class SearchResult {
        private String type; // DECISION | TASK | COMMITMENT | SUMMARY
        private String title;
        private String content;
        private String meetingTitle;
        private double score;
    }

    @Data
    @Builder
    public static class SearchResponse {
        private String query;
        private String answer;
        private List<SearchResult> citations;
    }

    @GetMapping("/graph")
    public ResponseEntity<GraphResponse> getContextGraph() {
        List<GraphNode> nodes = new ArrayList<>();
        List<GraphEdge> edges = new ArrayList<>();

        // 1. Users
        List<User> users = userRepository.findAll();
        for (User u : users) {
            nodes.add(GraphNode.builder()
                    .id("user-" + u.getId())
                    .label(u.getName())
                    .type("USER")
                    .data(Map.of("email", u.getEmail(), "role", u.getRole().name()))
                    .build());
        }

        // 2. Meetings
        List<Meeting> meetings = meetingRepository.findAll();
        for (Meeting m : meetings) {
            String meetingNodeId = "meeting-" + m.getId();
            nodes.add(GraphNode.builder()
                    .id(meetingNodeId)
                    .label(m.getTitle())
                    .type("MEETING")
                    .data(Map.of("code", m.getMeetingCode(), "status", m.getStatus().name()))
                    .build());

            if (m.getHost() != null) {
                edges.add(GraphEdge.builder()
                        .id("edge-host-" + m.getId())
                        .source("user-" + m.getHost().getId())
                        .target(meetingNodeId)
                        .label("HOSTED")
                        .build());
            }
        }

        // 3. Decisions
        List<Decision> decisions = decisionRepository.findAll();
        for (Decision d : decisions) {
            String decNodeId = "decision-" + d.getId();
            nodes.add(GraphNode.builder()
                    .id(decNodeId)
                    .label(d.getTitle())
                    .type("DECISION")
                    .data(Map.of("reason", d.getReason() != null ? d.getReason() : "", "status", d.getStatus()))
                    .build());

            if (d.getMeeting() != null) {
                edges.add(GraphEdge.builder()
                        .id("edge-dec-" + d.getId())
                        .source("meeting-" + d.getMeeting().getId())
                        .target(decNodeId)
                        .label("DECIDED")
                        .build());
            }
        }

        // 4. Tasks
        List<Task> tasks = taskRepository.findAll();
        for (Task t : tasks) {
            String taskNodeId = "task-" + t.getId();
            nodes.add(GraphNode.builder()
                    .id(taskNodeId)
                    .label(t.getTitle())
                    .type("TASK")
                    .data(Map.of("status", t.getStatus(), "priority", t.getPriority()))
                    .build());

            if (t.getMeeting() != null) {
                edges.add(GraphEdge.builder()
                        .id("edge-task-" + t.getId())
                        .source("meeting-" + t.getMeeting().getId())
                        .target(taskNodeId)
                        .label("EXTRACTED_FROM")
                        .build());
            }

            if (t.getAssignee() != null) {
                edges.add(GraphEdge.builder()
                        .id("edge-assign-" + t.getId())
                        .source(taskNodeId)
                        .target("user-" + t.getAssignee().getId())
                        .label("ASSIGNED_TO")
                        .build());
            }
        }

        // 5. Commitments
        List<Commitment> commitments = commitmentRepository.findAll();
        for (Commitment c : commitments) {
            String comNodeId = "commitment-" + c.getId();
            nodes.add(GraphNode.builder()
                    .id(comNodeId)
                    .label(c.getDescription())
                    .type("COMMITMENT")
                    .data(Map.of("status", c.getStatus()))
                    .build());

            if (c.getPerson() != null) {
                edges.add(GraphEdge.builder()
                        .id("edge-com-person-" + c.getId())
                        .source("user-" + c.getPerson().getId())
                        .target(comNodeId)
                        .label("COMMITTED_TO")
                        .build());
            }

            if (c.getMeeting() != null) {
                edges.add(GraphEdge.builder()
                        .id("edge-com-meet-" + c.getId())
                        .source("meeting-" + c.getMeeting().getId())
                        .target(comNodeId)
                        .label("COMMITTED_IN")
                        .build());
            }
        }

        return ResponseEntity.ok(GraphResponse.builder()
                .nodes(nodes)
                .edges(edges)
                .build());
    }

    @PostMapping("/search")
    public ResponseEntity<SearchResponse> searchMemory(@RequestBody SearchRequest request) {
        String query = request.getQuery() != null ? request.getQuery().toLowerCase() : "";
        List<SearchResult> citations = new ArrayList<>();

        // Search Decisions
        for (Decision d : decisionRepository.findAll()) {
            if (d.getTitle().toLowerCase().contains(query) || (d.getReason() != null && d.getReason().toLowerCase().contains(query))) {
                citations.add(SearchResult.builder()
                        .type("DECISION")
                        .title(d.getTitle())
                        .content(d.getReason() != null ? d.getReason() : d.getDescription())
                        .meetingTitle(d.getMeeting() != null ? d.getMeeting().getTitle() : "ContextOS Meeting")
                        .score(0.92)
                        .build());
            }
        }

        // Search Tasks
        for (Task t : taskRepository.findAll()) {
            if (t.getTitle().toLowerCase().contains(query) || (t.getDescription() != null && t.getDescription().toLowerCase().contains(query))) {
                citations.add(SearchResult.builder()
                        .type("TASK")
                        .title(t.getTitle())
                        .content("Status: " + t.getStatus() + " | Priority: " + t.getPriority() + (t.getDescription() != null ? " | " + t.getDescription() : ""))
                        .meetingTitle(t.getMeeting() != null ? t.getMeeting().getTitle() : "ContextOS Meeting")
                        .score(0.87)
                        .build());
            }
        }

        // Search Commitments
        for (Commitment c : commitmentRepository.findAll()) {
            if (c.getDescription().toLowerCase().contains(query) || (c.getPersonNameRaw() != null && c.getPersonNameRaw().toLowerCase().contains(query))) {
                citations.add(SearchResult.builder()
                        .type("COMMITMENT")
                        .title(c.getDescription())
                        .content("Committed by: " + (c.getPerson() != null ? c.getPerson().getName() : c.getPersonNameRaw()) + " (Status: " + c.getStatus() + ")")
                        .meetingTitle(c.getMeeting() != null ? c.getMeeting().getTitle() : "ContextOS Meeting")
                        .score(0.85)
                        .build());
            }
        }

        // Search Summaries
        for (MeetingSummary s : summaryRepository.findAll()) {
            if (s.getOverview() != null && s.getOverview().toLowerCase().contains(query)) {
                citations.add(SearchResult.builder()
                        .type("SUMMARY")
                        .title("Meeting Summary")
                        .content(s.getOverview())
                        .meetingTitle(s.getMeeting() != null ? s.getMeeting().getTitle() : "ContextOS Meeting")
                        .score(0.95)
                        .build());
            }
        }

        String synthesizedAnswer;
        if (citations.isEmpty()) {
            synthesizedAnswer = "I searched across all recorded meetings, decisions, tasks, and commitments in ContextOS memory, but could not find a direct match for: \"" + request.getQuery() + "\".";
        } else {
            synthesizedAnswer = "Based on ContextOS organizational memory, I found " + citations.size() + " relevant record(s). " +
                    "The most relevant context indicates: \"" + citations.get(0).getContent() + "\" " +
                    "(Source: " + citations.get(0).getMeetingTitle() + ").";
        }

        return ResponseEntity.ok(SearchResponse.builder()
                .query(request.getQuery())
                .answer(synthesizedAnswer)
                .citations(citations)
                .build());
    }
}

