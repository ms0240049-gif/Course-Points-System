using CoursePoints.Api.Domain;
using CoursePoints.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CoursePoints.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ApplicationUser> Users => Set<ApplicationUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseStudent> CourseStudents => Set<CourseStudent>();
    public DbSet<CourseInstructor> CourseInstructors => Set<CourseInstructor>();
    public DbSet<CourseSession> CourseSessions => Set<CourseSession>();
    public DbSet<PointsLog> PointsLogs => Set<PointsLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Email).HasMaxLength(256);
            entity.Property(x => x.FullName).HasMaxLength(160);
            entity.Property(x => x.PasswordHash).HasMaxLength(512);
            entity.Property(x => x.Role).HasMaxLength(32);
            entity.HasIndex(x => x.CreatedByUserId);
            entity.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.ToTable(t => t.HasCheckConstraint("CK_Users_Role", $"\"Role\" IN ('{AppRoles.Admin}', '{AppRoles.Instructor}', '{AppRoles.Student}')"));
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.Property(x => x.TokenHash).HasMaxLength(128);
            entity.Property(x => x.ReplacedByTokenHash).HasMaxLength(128);
            entity.HasOne(x => x.User)
                .WithMany(x => x.RefreshTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasIndex(x => x.Code).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(160);
            entity.Property(x => x.Code).HasMaxLength(32);
            entity.Property(x => x.Description).HasMaxLength(600);
            entity.HasOne(x => x.CreatedByAdmin)
                .WithMany(x => x.CreatedCourses)
                .HasForeignKey(x => x.CreatedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CourseStudent>(entity =>
        {
            entity.HasKey(x => new { x.CourseId, x.StudentId });
            entity.HasIndex(x => new { x.CourseId, x.StudentId, x.IsActive });
            entity.HasOne(x => x.Course)
                .WithMany(x => x.CourseStudents)
                .HasForeignKey(x => x.CourseId);
            entity.HasOne(x => x.Student)
                .WithMany(x => x.CourseStudents)
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CourseInstructor>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.CourseId, x.InstructorId }).IsUnique();
            entity.HasIndex(x => new { x.CourseId, x.InstructorId, x.IsActive });
            entity.HasOne(x => x.Course)
                .WithMany(x => x.CourseInstructors)
                .HasForeignKey(x => x.CourseId);
            entity.HasOne(x => x.Instructor)
                .WithMany(x => x.CourseInstructors)
                .HasForeignKey(x => x.InstructorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CourseSession>(entity =>
        {
            entity.Property(x => x.Title).HasMaxLength(160);
            entity.HasOne(x => x.Course)
                .WithMany(x => x.Sessions)
                .HasForeignKey(x => x.CourseId);
        });

        modelBuilder.Entity<PointsLog>(entity =>
        {
            entity.Property(x => x.Reason).HasMaxLength(300);
            entity.HasIndex(x => new { x.CourseId, x.StudentId });
            entity.HasIndex(x => new { x.CourseId, x.StudentId, x.CourseSessionId, x.Type })
                .IsUnique()
                .HasFilter("\"Type\" = 1 AND \"CourseSessionId\" IS NOT NULL");
            entity.HasOne(x => x.Student)
                .WithMany()
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Course)
                .WithMany(x => x.PointsLogs)
                .HasForeignKey(x => x.CourseId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.CourseSession)
                .WithMany(x => x.PointsLogs)
                .HasForeignKey(x => x.CourseSessionId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(x => x.CreatedByAdmin)
                .WithMany()
                .HasForeignKey(x => x.CreatedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
