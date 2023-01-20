import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { LoaderEnv } from 'src/config/loader';
import { MailProcessor } from 'src/app/mail/mail.processor';
import { MailService } from './mail.service';

@Module({
    imports: [
        MailerModule.forRoot(LoaderEnv.mailCred()),
        BullModule.registerQueue({
            name: "MAIL_QUEUE",
        })
    ],
    providers: [MailService, MailProcessor],
    exports: [MailService]
})
export class MailModule {}
