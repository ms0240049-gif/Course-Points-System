using CoursePoints.Api.Domain;
using CoursePoints.Api.Entities;
using CoursePoints.Api.Options;
using CoursePoints.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CoursePoints.Api.Data;

public class DatabaseSeeder(
    AppDbContext dbContext,
    IPasswordHasher passwordHasher,
    IOptions<AdminSeedOptions> adminOptions,
    ILogger<DatabaseSeeder> logger)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (dbContext.Database.IsRelational())
        {
            await dbContext.Database.MigrateAsync(cancellationToken);
        }
        else
        {
            await dbContext.Database.EnsureCreatedAsync(cancellationToken);
        }

        var options = adminOptions.Value;
        var normalizedEmail = options.Email.Trim().ToLowerInvariant();
        var adminExists = await dbContext.Users.AnyAsync(x => x.Email == normalizedEmail, cancellationToken);
        if (adminExists)
        {
            var existingAdmin = await dbContext.Users.SingleAsync(x => x.Email == normalizedEmail, cancellationToken);
            var changed = false;

            if (existingAdmin.FullName != options.FullName)
            {
                existingAdmin.FullName = options.FullName;
                changed = true;
            }

            if (!passwordHasher.Verify(options.Password, existingAdmin.PasswordHash))
            {
                existingAdmin.PasswordHash = passwordHasher.Hash(options.Password);
                changed = true;
            }

            if (existingAdmin.MustChangePassword != options.MustChangePassword)
            {
                changed = true;
                existingAdmin.MustChangePassword = options.MustChangePassword;
            }

            if (existingAdmin.Role != AppRoles.Admin)
            {
                existingAdmin.Role = AppRoles.Admin;
                changed = true;
            }

            if (!existingAdmin.IsActive)
            {
                existingAdmin.IsActive = true;
                changed = true;
            }

            if (changed)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
                logger.LogInformation("Synchronized default admin account {Email}.", normalizedEmail);
            }

            return;
        }

        dbContext.Users.Add(new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            FullName = options.FullName,
            PasswordHash = passwordHasher.Hash(options.Password),
            Role = AppRoles.Admin,
            MustChangePassword = options.MustChangePassword,
            IsActive = true
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded default admin account {Email}. Change this password after first login.", normalizedEmail);
    }
}
