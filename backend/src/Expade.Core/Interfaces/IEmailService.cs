namespace Expade.Core.Interfaces;
public interface IEmailService
{
    Task SendBusinessRequestConfirmationEmailAsync(string toEmail, string userName, string businessName);
    Task SendBusinessRequestRejectionEmailAsync(string toEmail, string userName, string businessName);
    Task SendBusinessRequestApprovedEmailAsync(string toEmail, string userName, string businessName, Guid requestId);
    Task SendBusinessLaunchedEmailAsync(string toEmail, string userName, string businessName);
}