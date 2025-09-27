-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_cardId_fkey";

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "password" DROP DEFAULT;
