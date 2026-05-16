using System.ComponentModel.DataAnnotations;
using CoursePoints.Api.Domain;

namespace CoursePoints.Api.DTOs;

public record AttendancePointsRequest(
    [Required] Guid StudentId,
    Guid? CourseSessionId,
    bool IsPresent);

public record BulkAttendanceItemRequest(
    [Required] Guid StudentId,
    AttendanceStatus Status,
    [MaxLength(220)] string? Reason);

public record BulkAttendanceRequest(
    [Required] Guid CourseSessionId,
    [Required, MinLength(1)] IReadOnlyList<BulkAttendanceItemRequest> Items);

public record BulkAttendanceSummaryDto(
    int TotalStudents,
    int PresentCount,
    int AbsentCount,
    int ExcusedCount,
    int TotalPointsAdded);

public record AttendanceSessionItemDto(Guid StudentId, AttendanceStatus Status, string? Reason);

public record QuestionPointsRequest(
    [Required] Guid StudentId,
    Guid? CourseSessionId,
    QuestionResult Result);

public record ContestPointsRequest(
    [Required] Guid StudentId,
    int? Rank);

public record ManualPointsRequest(
    [Required] Guid StudentId,
    [Range(-1000, 1000)] int Points,
    [Required, MaxLength(300)] string Reason);

public record PointsLogDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    Guid CourseId,
    Guid? CourseSessionId,
    PointLogType Type,
    AttendanceStatus? AttendanceStatus,
    int Points,
    string Reason,
    DateTimeOffset CreatedAt);

public record LeaderboardEntryDto(Guid StudentId, string StudentName, string Email, int TotalPoints);
