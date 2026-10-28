package com.contextos.controller;

import com.contextos.model.ai.Task;
import com.contextos.repository.ai.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;

    @GetMapping
    public ResponseEntity<List<Task>> getTasks() {
        return ResponseEntity.ok(taskRepository.findAll());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setStatus(body.get("status"));
        return ResponseEntity.ok(taskRepository.save(task));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<Task> updateProgress(@PathVariable UUID id, @RequestBody Map<String, Integer> body) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setProgress(body.get("progress"));
        return ResponseEntity.ok(taskRepository.save(task));
    }

    @PatchMapping("/reorder")
    @Transactional
    public ResponseEntity<?> reorderTasks(@RequestBody List<Map<String, Object>> updates) {
        for (Map<String, Object> update : updates) {
            UUID taskId = UUID.fromString((String) update.get("id"));
            String status = (String) update.get("status");
            Double position = Double.valueOf(update.get("position").toString());
            
            Task task = taskRepository.findById(taskId).orElseThrow();
            if (status != null) task.setStatus(status);
            task.setPosition(position);
            taskRepository.save(task);
        }
        return ResponseEntity.ok(Map.of("message", "Tasks reordered"));
    }
}
