import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { LoaderEnv } from 'src/config/loader';

@Injectable()
@Processor('MAIL_QUEUE')
export class MailProcessor {
  private readonly _logger = new Logger(MailProcessor.name);

  constructor(private readonly _mailerService: MailerService) {}

  @OnQueueActive()
  public onActive(job: Job) {
    this._logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  public onComplete(job: Job) {
    this._logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  public onError(job: Job<any>, error: any) {
    this._logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process('CONFIRM_REGISTRATION')
  public async confirmRegistration(
    job: Job<{ name: string; emailAddress: string; confirmUrl: string }>,
  ) {
    this._logger.log(
      `Sending confirm registration email to '${job.data.emailAddress}'`,
    );

    try {
      return this._mailerService.sendMail({
        to: job.data.emailAddress,
        from: LoaderEnv.envs.MAIL_FROM,
        template: './email-confirmation',
        subject: 'Registration',
        context: {
          name: job.data.name,
          confirmUrl: job.data.confirmUrl,
        },
      });
    } catch {
      this._logger.error(
        `Failed to send confirmation email to '${job.data.emailAddress}'`,
      );
    }
  }
}
