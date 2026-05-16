using System;
using CoursePoints.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoursePoints.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260505123000_AddInstructorsAndBulkAttendance")]
public partial class AddInstructorsAndBulkAttendance : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropCheckConstraint("CK_Users_Role", "Users");

        migrationBuilder.AddColumn<bool>(
            name: "IsActive",
            table: "CourseStudents",
            type: "boolean",
            nullable: false,
            defaultValue: true);

        migrationBuilder.AddColumn<int>(
            name: "AttendanceStatus",
            table: "PointsLogs",
            type: "integer",
            nullable: true);

        migrationBuilder.AddCheckConstraint(
            name: "CK_Users_Role",
            table: "Users",
            sql: "\"Role\" IN ('Admin', 'Instructor', 'Student')");

        migrationBuilder.CreateTable(
            name: "CourseInstructors",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                InstructorId = table.Column<Guid>(type: "uuid", nullable: false),
                AssignedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CourseInstructors", x => x.Id);
                table.ForeignKey(
                    name: "FK_CourseInstructors_Courses_CourseId",
                    column: x => x.CourseId,
                    principalTable: "Courses",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_CourseInstructors_Users_InstructorId",
                    column: x => x.InstructorId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_CourseStudents_CourseId_StudentId_IsActive",
            table: "CourseStudents",
            columns: new[] { "CourseId", "StudentId", "IsActive" });

        migrationBuilder.CreateIndex(
            name: "IX_PointsLogs_CourseId_StudentId_CourseSessionId_Type",
            table: "PointsLogs",
            columns: new[] { "CourseId", "StudentId", "CourseSessionId", "Type" },
            unique: true,
            filter: "\"Type\" = 1 AND \"CourseSessionId\" IS NOT NULL");

        migrationBuilder.CreateIndex(
            name: "IX_CourseInstructors_CourseId_InstructorId",
            table: "CourseInstructors",
            columns: new[] { "CourseId", "InstructorId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_CourseInstructors_CourseId_InstructorId_IsActive",
            table: "CourseInstructors",
            columns: new[] { "CourseId", "InstructorId", "IsActive" });

        migrationBuilder.CreateIndex(
            name: "IX_CourseInstructors_InstructorId",
            table: "CourseInstructors",
            column: "InstructorId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("CourseInstructors");
        migrationBuilder.DropIndex("IX_PointsLogs_CourseId_StudentId_CourseSessionId_Type", "PointsLogs");
        migrationBuilder.DropIndex("IX_CourseStudents_CourseId_StudentId_IsActive", "CourseStudents");
        migrationBuilder.DropCheckConstraint("CK_Users_Role", "Users");
        migrationBuilder.DropColumn("AttendanceStatus", "PointsLogs");
        migrationBuilder.DropColumn("IsActive", "CourseStudents");
        migrationBuilder.AddCheckConstraint(
            name: "CK_Users_Role",
            table: "Users",
            sql: "\"Role\" IN ('Admin', 'Student')");
    }
}
