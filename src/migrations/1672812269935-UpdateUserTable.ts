import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateUserTable1672812269935 implements MigrationInterface {
    name = 'UpdateUserTable1672812269935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."users_gender_enum" AS ENUM('m', 'f')
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "gender" "public"."users_gender_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "uq_users__nickname" UNIQUE ("nickname")
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "uq_users__phone" UNIQUE ("phone")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "uq_users__phone"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "uq_users__nickname"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "gender"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_gender_enum"
        `);
    }

}
