using System;
using CoursePoints.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoursePoints.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260505124500_AddCourseCreatedByUser")]
public partial class AddCourseCreatedByUser : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "CreatedByUserId",
            table: "Courses",
            type: "uuid",
            nullable: false,
            defaultValue: Guid.Empty);

        migrationBuilder.Sql("UPDATE \"Courses\" SET \"CreatedByUserId\" = \"CreatedByAdminId\" WHERE \"CreatedByUserId\" = '00000000-0000-0000-0000-000000000000'");

        migrationBuilder.CreateIndex(
            name: "IX_Courses_CreatedByUserId",
            table: "Courses",
            column: "CreatedByUserId");

        migrationBuilder.AddForeignKey(
            name: "FK_Courses_Users_CreatedByUserId",
            table: "Courses",
            column: "CreatedByUserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey("FK_Courses_Users_CreatedByUserId", "Courses");
        migrationBuilder.DropIndex("IX_Courses_CreatedByUserId", "Courses");
        migrationBuilder.DropColumn("CreatedByUserId", "Courses");
    }
}
