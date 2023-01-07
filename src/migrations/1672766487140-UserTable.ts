import {MigrationInterface, QueryRunner} from "typeorm";

export class UserTable1672766487140 implements MigrationInterface {
    name = 'UserTable1672766487140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying(200) NOT NULL,
                "nickname" character varying(50) NOT NULL,
                "phone" character varying(15) NOT NULL,
                "email" character varying(200) NOT NULL,
                "password" text NOT NULL,
                "dob" date NOT NULL,
                "avatar" character varying NOT NULL,
                "is_verified" boolean NOT NULL DEFAULT false,
                CONSTRAINT "uq_users__email" UNIQUE ("email"),
                CONSTRAINT "pk_users__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_users_id" ON "users" ("id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."idx_users_id"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }

}
