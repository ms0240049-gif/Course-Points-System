namespace CoursePoints.Api.Options;

public class AdminSeedOptions
{
    public const string SectionName = "DefaultAdmin";

    public required string Email { get; set; }
    public required string Password { get; set; }
    public string FullName { get; set; } = "System Administrator";
    public bool MustChangePassword { get; set; }
}
