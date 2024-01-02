import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private async sendEmail({ to, text, html, subject }: ISendMailOptions) {
    try {
      await this.mailService.sendMail({
        to,
        from: 'Swoosh Store',
        text,
        html,
        subject,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendPasswordResetEmail(email: string, passwordResetToken: string) {
    const href = `${this.configService.get(
        'CLIENT_URI',
      )}auth/reset-password?email=${email}&token=${passwordResetToken}`,
      html = `<p>Click on the  <a href=${href}>link</a> to reset your password</p>`,
      subject = 'Swoosh-Store reset password ✅';

    await this.sendEmail({ to: email, html, subject });
  }
}
