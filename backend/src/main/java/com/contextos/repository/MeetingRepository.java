package com.contextos.repository;

import com.contextos.model.Meeting;
import com.contextos.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
    Optional<Meeting> findByMeetingCode(String meetingCode);

    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN MeetingParticipant mp ON m.id = mp.meeting.id WHERE m.host = :user OR (mp.user = :user AND mp.accessStatus = 'ACCEPTED')")
    Page<Meeting> findMeetingsForUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Meeting m WHERE m.host = :user AND m.startTime >= :now AND m.status = 'SCHEDULED'")
    long countUpcomingByHost(@Param("user") User user, @Param("now") ZonedDateTime now);

    @Query("SELECT COUNT(m) FROM Meeting m WHERE m.host = :user AND m.startTime >= :startOfDay AND m.startTime < :endOfDay")
    long countTodayByHost(@Param("user") User user, @Param("startOfDay") ZonedDateTime startOfDay, @Param("endOfDay") ZonedDateTime endOfDay);
    
    @Query("SELECT COUNT(m) FROM Meeting m WHERE m.host = :user AND m.status = 'COMPLETED'")
    long countCompletedByHost(@Param("user") User user);
    
    @Query("SELECT m FROM Meeting m WHERE m.host = :user AND m.startTime >= :startOfDay AND m.startTime < :endOfDay ORDER BY m.startTime ASC")
    List<Meeting> findTodayAgenda(@Param("user") User user, @Param("startOfDay") ZonedDateTime startOfDay, @Param("endOfDay") ZonedDateTime endOfDay);

    List<Meeting> findByStartTimeBetweenAndStatus(ZonedDateTime start, ZonedDateTime end, com.contextos.model.MeetingStatus status);
}
