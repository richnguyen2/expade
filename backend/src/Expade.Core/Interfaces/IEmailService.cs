namespace Expade.Core.Interfaces;
public interface IEmailService
{
    Task SendBusinessRequestConfirmationEmailAsync(string toEmail, string userName, string businessName);
    Task SendBusinessRequestRejectionEmailAsync(string toEmail, string userName, string businessName);
    Task SendBusinessRequestApprovedEmailAsync(string toEmail, string userName, string businessName, Guid requestId);
    Task SendBusinessLaunchedEmailAsync(string toEmail, string userName, string businessName);

    /// <summary>Notify the business (assigned staff) that a new appointment was requested.</summary>
    Task SendNewAppointmentEmailAsync(string toEmail, string staffName, string clientName, string serviceName, string whenFormatted);

    /// <summary>Notify the client that their appointment was confirmed by the business.</summary>
    Task SendAppointmentConfirmedEmailAsync(string toEmail, string clientName, string businessName, string serviceName, string whenFormatted);

    /// <summary>Notify the client that their appointment was cancelled because the business was deleted.</summary>
    Task SendAppointmentCancelledEmailAsync(string toEmail, string clientName, string businessName, string serviceName, string whenFormatted);
}