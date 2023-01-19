import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateUserAddLoginType1674121616724 implements MigrationInterface {
    name = 'UpdateUserAddLoginType1674121616724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."users_auth_type_enum" AS ENUM(
                'google',
                'twitter',
                'email',
                'kakao',
                'naver',
                'line'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "auth_type" "public"."users_auth_type_enum" NOT NULL DEFAULT 'email'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "auth_type"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_auth_type_enum"
        `);
    }

}
