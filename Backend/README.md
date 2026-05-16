# Course Points Management API

ASP.NET Core Web API backend for admin-managed student accounts, JWT auth, refresh token rotation, role authorization, and points-based course leaderboards.

## Run locally

1. Update `ConnectionStrings:DefaultConnection` in `appsettings.json` if you are not using SQL Server LocalDB.
2. Restore and build:

```powershell
dotnet restore
dotnet build
```

3. Apply migrations:

```powershell
dotnet ef database update
```

4. Run the API:

```powershell
dotnet run
```

Swagger UI is available in development at `/swagger`.

## Seeded Admin

The startup seeder creates this admin account if it does not exist:

- Email: `admin@coursepoints.local`
- Password: `Admin@12345`

The seeded admin has `MustChangePassword = true`, so log in first, then call `POST /api/auth/change-password`.

## Point Rules

- Attendance present: `5`
- Attendance absent: `0`
- Session question correct: `5`
- Session question close: `2`
- Session question none: `0`
- Mini contest rank 1: `20`
- Mini contest rank 2: `15`
- Mini contest rank 3: `10`
- Other mini contest participants: `5`

All score changes are stored in `PointsLogs`; leaderboards are calculated with `SUM(PointsLogs.Points)`.
