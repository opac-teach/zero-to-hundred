import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1742903727210 implements MigrationInterface {
    name = 'InitialMigration1742903727210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('BUY', 'SELL', 'CREATE')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "memecoinId" uuid NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "memeCoinAmount" numeric(24,8) NOT NULL, "zthAmount" numeric(24,8) NOT NULL, "price" numeric(24,8) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "memecoins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "symbol" character varying NOT NULL, "description" character varying, "logoUrl" character varying, "creatorId" uuid NOT NULL, "totalSupply" numeric(24,8) NOT NULL DEFAULT '1', "currentPrice" numeric(24,8) NOT NULL DEFAULT '1', "volume24h" numeric(24,8) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "curveConfig" jsonb NOT NULL DEFAULT '{"slope":"2","startingPrice":"1","curveType":"linear"}', CONSTRAINT "UQ_bdde94fcd75d21fa156cbe9e2cf" UNIQUE ("symbol"), CONSTRAINT "PK_3fd0eb0713d4dcd778a6c0ecb68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wallet_holdings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "walletId" uuid NOT NULL, "memecoinId" uuid NOT NULL, "amount" numeric(24,8) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ef9e6aad5dddd81c3ebd3197187" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownerId" uuid NOT NULL, "zthBalance" numeric(24,8) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_342cecf691b0d12172e69b2b8f" UNIQUE ("ownerId"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "userTitle" character varying, "password" character varying NOT NULL, "profilePictureUrl" character varying, "bannerUrl" character varying, "description" text, "backgroundColor" character varying NOT NULL DEFAULT '#f5f5f5', "textColor" character varying NOT NULL DEFAULT '#333333', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_fced82bd7ec8a4047256c59d05c" FOREIGN KEY ("memecoinId") REFERENCES "memecoins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "memecoins" ADD CONSTRAINT "FK_b202558c0c50757af281089018e" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_holdings" ADD CONSTRAINT "FK_56c8b3087be1283cd96688787b6" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_holdings" ADD CONSTRAINT "FK_e0c36df9ddd88b7ca63b00a863d" FOREIGN KEY ("memecoinId") REFERENCES "memecoins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_342cecf691b0d12172e69b2b8f9" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_342cecf691b0d12172e69b2b8f9"`);
        await queryRunner.query(`ALTER TABLE "wallet_holdings" DROP CONSTRAINT "FK_e0c36df9ddd88b7ca63b00a863d"`);
        await queryRunner.query(`ALTER TABLE "wallet_holdings" DROP CONSTRAINT "FK_56c8b3087be1283cd96688787b6"`);
        await queryRunner.query(`ALTER TABLE "memecoins" DROP CONSTRAINT "FK_b202558c0c50757af281089018e"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_fced82bd7ec8a4047256c59d05c"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TABLE "wallet_holdings"`);
        await queryRunner.query(`DROP TABLE "memecoins"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    }

}
