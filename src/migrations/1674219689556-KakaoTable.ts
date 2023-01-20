import {MigrationInterface, QueryRunner} from "typeorm";

export class KakaoTable1674219689556 implements MigrationInterface {
    name = 'KakaoTable1674219689556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "kakao-ids" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "access_token" character varying(200) NOT NULL,
                "kakao_user_id" character varying(50),
                "user_id" character varying NOT NULL,
                CONSTRAINT "pk_kakao-ids__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_kakao-ids_id" ON "kakao-ids" ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "phone"
            SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "phone" DROP NOT NULL
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_kakao-ids_id"
        `);
        await queryRunner.query(`
            DROP TABLE "kakao-ids"
        `);
    }

}
