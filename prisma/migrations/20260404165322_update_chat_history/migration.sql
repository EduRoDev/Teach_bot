-- DropForeignKey
ALTER TABLE "chat_histories" DROP CONSTRAINT "chat_histories_document_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_histories" DROP CONSTRAINT "chat_histories_user_id_fkey";

-- AlterTable
ALTER TABLE "chat_histories" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "chat_histories_user_id_document_id_idx" ON "chat_histories"("user_id", "document_id");

-- CreateIndex
CREATE INDEX "chat_histories_timestamp_idx" ON "chat_histories"("timestamp");

-- AddForeignKey
ALTER TABLE "chat_histories" ADD CONSTRAINT "chat_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_histories" ADD CONSTRAINT "chat_histories_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
