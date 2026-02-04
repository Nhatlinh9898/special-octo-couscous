-- AlterTable
ALTER TABLE "grades" 
ADD COLUMN     "oral" DECIMAL(5,2),
ADD COLUMN     "quiz1" DECIMAL(5,2),
ADD COLUMN     "quiz2" DECIMAL(5,2),
ADD COLUMN     "one_hour" DECIMAL(5,2),
ADD COLUMN     "midterm" DECIMAL(5,2),
ADD COLUMN     "final" DECIMAL(5,2),
ADD COLUMN     "average" DECIMAL(5,2) DEFAULT 0;

-- AddIndex
CREATE INDEX "idx_grades_student_subject_class_semester_year" ON "grades"("studentId", "subjectId", "classId", "semester", "academicYear");

-- AddColumn
ALTER TABLE "students" 
ADD COLUMN     "room_id" INTEGER;

-- AddForeignKey
ALTER TABLE "students" 
ADD CONSTRAINT "fk_students_room_id" 
FOREIGN KEY ("room_id") 
REFERENCES "ktx_rooms" ("id") 
ON DELETE SET NULL ON UPDATE CASCADE;
