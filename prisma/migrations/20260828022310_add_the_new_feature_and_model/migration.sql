/*
  Warnings:

  - The values [VILLA,COMMERCIAL] on the enum `PropertyType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `age` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `area` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `baths` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `bhk` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `facing` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `floor` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `furnished` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `totalFloors` on the `Property` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PlotType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'AGRICULTURAL', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "SharingType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR', 'FIVE_PLUS');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('MALE', 'FEMALE', 'ANY');

-- AlterEnum
BEGIN;
CREATE TYPE "PropertyType_new" AS ENUM ('FLAT', 'PLOT', 'PG_ROOM');
ALTER TABLE "Property" ALTER COLUMN "type" TYPE "PropertyType_new" USING ("type"::text::"PropertyType_new");
ALTER TYPE "PropertyType" RENAME TO "PropertyType_old";
ALTER TYPE "PropertyType_new" RENAME TO "PropertyType";
DROP TYPE "public"."PropertyType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "age",
DROP COLUMN "area",
DROP COLUMN "baths",
DROP COLUMN "bhk",
DROP COLUMN "facing",
DROP COLUMN "floor",
DROP COLUMN "furnished",
DROP COLUMN "totalFloors",
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PlotDetails" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "plotType" "PlotType" NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "areaUnit" TEXT NOT NULL,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "facing" TEXT,
    "roadWidth" DOUBLE PRECISION,
    "nearPlaces" TEXT[],
    "boundaryWall" BOOLEAN NOT NULL DEFAULT false,
    "waterAvailable" BOOLEAN NOT NULL DEFAULT false,
    "electricityAvailable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlotDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlatDetails" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "carpetArea" DOUBLE PRECISION,
    "builtUpArea" DOUBLE PRECISION,
    "areaUnit" TEXT,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "furnished" "Furnished",
    "facing" TEXT,
    "age" INTEGER,
    "balconies" INTEGER,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "roomSize" JSONB,

    CONSTRAINT "FlatDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PGDetails" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomSize" DOUBLE PRECISION,
    "areaUnit" TEXT,
    "sharingType" "SharingType" NOT NULL,
    "totalBeds" INTEGER,
    "availableBeds" INTEGER,
    "genderPreference" "GenderPreference" NOT NULL,
    "attachedBathroom" BOOLEAN NOT NULL DEFAULT false,
    "balcony" BOOLEAN NOT NULL DEFAULT false,
    "furnished" BOOLEAN NOT NULL DEFAULT false,
    "foodAvailable" BOOLEAN NOT NULL DEFAULT false,
    "foodType" TEXT,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "securityDeposit" DOUBLE PRECISION,
    "maintenanceCharge" DOUBLE PRECISION,

    CONSTRAINT "PGDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlotDetails_propertyId_key" ON "PlotDetails"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "FlatDetails_propertyId_key" ON "FlatDetails"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PGDetails_propertyId_key" ON "PGDetails"("propertyId");

-- AddForeignKey
ALTER TABLE "PlotDetails" ADD CONSTRAINT "PlotDetails_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlatDetails" ADD CONSTRAINT "FlatDetails_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGDetails" ADD CONSTRAINT "PGDetails_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
