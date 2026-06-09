namespace Expade.Core.Interfaces;
public interface IEmailService
{
    Task SendBusinessRequestConfirmationEmailAsync(string toEmail, string userName, string businessName);
}