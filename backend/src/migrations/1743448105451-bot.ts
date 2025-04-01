import { MigrationInterface, QueryRunner } from "typeorm";

export class Bot1743448105451 implements MigrationInterface {
    name = 'Bot1743448105451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bot" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bot"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
