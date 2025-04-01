import { MigrationInterface, QueryRunner } from "typeorm";

export class Casing1743493090800 implements MigrationInterface {
    name = 'Casing1743493090800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "memeCoinAmount" TO "memecoinAmount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "memecoinAmount" TO "memeCoinAmount"`);
    }

}
