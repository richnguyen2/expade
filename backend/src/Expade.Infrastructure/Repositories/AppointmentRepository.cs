using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Expade.Infrastructure.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _db;

    public AppointmentRepository(AppDbContext db) => _db = db;

    public async Task<Appointment?> GetByIdAsync(Guid id) =>
        await _db.Appointments
            .Include(a => a.Service)
                .ThenInclude(s => s.Business)
            .Include(a => a.Worker)
                .ThenInclude(w => w.User)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IEnumerable<Appointment>> GetByClientIdAsync(Guid clientId) =>
        await _db.Appointments
            .Where(a => a.ClientId == clientId)
            .Include(a => a.Service)
                .ThenInclude(s => s.Business)
            .Include(a => a.Worker)
                .ThenInclude(w => w.User)
            .OrderBy(a => a.StartDateTime)
            .ToListAsync();

    public async Task<IEnumerable<Appointment>> GetByWorkerAndDateAsync(Guid workerId, DateOnly date)
    {
        var startOfDay = new DateTimeOffset(date.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var endOfDay = startOfDay.AddDays(1);

        return await _db.Appointments
            .Where(a =>
                a.WorkerId == workerId &&
                a.Status != AppointmentStatus.Cancelled &&
                a.StartDateTime >= startOfDay &&
                a.StartDateTime < endOfDay)
            .Include(a => a.Service)
            .ToListAsync();
    }

    public async Task AddAsync(Appointment appointment)
    {
        await _db.Appointments.AddAsync(appointment);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Appointment appointment)
    {
        _db.Appointments.Update(appointment);
        await _db.SaveChangesAsync();
    }
}
