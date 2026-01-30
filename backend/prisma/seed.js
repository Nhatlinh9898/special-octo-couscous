"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = require("./src/utils/bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const school = await prisma.school.create({
        data: {
            name: 'EduManager Demo School',
            code: 'EDU001',
            address: '123 Education Street, Learning City, LC 12345',
            phone: '+1-555-0123',
            email: 'info@edumanager.demo',
            logoUrl: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=EDU',
            settings: {
                timezone: 'UTC',
                language: 'en',
                academicYear: '2024-2025',
                semester: 'Fall',
            },
        },
    });
    console.log(`✅ Created school: ${school.name}`);
    const adminPassword = await (0, bcrypt_1.hash)('admin123', 12);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@edumanager.demo',
            password: adminPassword,
            fullName: 'System Administrator',
            role: 'ADMIN',
            schoolId: school.id,
            phone: '+1-555-0100',
            address: '123 Admin Street, Admin City, AC 10001',
        },
    });
    console.log(`✅ Created admin user: ${admin.email}`);
    const teacherPassword = await (0, bcrypt_1.hash)('teacher123', 12);
    const mathTeacher = await prisma.user.create({
        data: {
            email: 'math.teacher@edumanager.demo',
            password: teacherPassword,
            fullName: 'John Mathematics',
            role: 'TEACHER',
            schoolId: school.id,
            phone: '+1-555-0101',
            address: '123 Teacher Street, Teacher City, TC 10002',
        },
    });
    const scienceTeacher = await prisma.user.create({
        data: {
            email: 'science.teacher@edumanager.demo',
            password: teacherPassword,
            fullName: 'Jane Science',
            role: 'TEACHER',
            schoolId: school.id,
            phone: '+1-555-0102',
            address: '123 Science Street, Science City, SC 10003',
        },
    });
    console.log(`✅ Created teacher users`);
    const parentPassword = await (0, bcrypt_1.hash)('parent123', 12);
    const parent = await prisma.user.create({
        data: {
            email: 'parent@edumanager.demo',
            password: parentPassword,
            fullName: 'Robert Parent',
            role: 'PARENT',
            schoolId: school.id,
            phone: '+1-555-0103',
            address: '123 Parent Street, Parent City, PC 10004',
        },
    });
    console.log(`✅ Created parent user`);
    const mathSubject = await prisma.subject.create({
        data: {
            schoolId: school.id,
            code: 'MATH101',
            name: 'Mathematics',
            description: 'Fundamental mathematics including algebra, geometry, and calculus',
            credits: 4,
            color: '#3B82F6',
        },
    });
    const scienceSubject = await prisma.subject.create({
        data: {
            schoolId: school.id,
            code: 'SCI101',
            name: 'Science',
            description: 'General science covering physics, chemistry, and biology',
            credits: 3,
            color: '#10B981',
        },
    });
    const englishSubject = await prisma.subject.create({
        data: {
            schoolId: school.id,
            code: 'ENG101',
            name: 'English Literature',
            description: 'English language and literature studies',
            credits: 3,
            color: '#F59E0B',
        },
    });
    console.log(`✅ Created subjects`);
    const class10A = await prisma.class.create({
        data: {
            schoolId: school.id,
            code: '10A',
            name: 'Class 10A',
            gradeLevel: 10,
            academicYear: '2024-2025',
            homeroomTeacherId: mathTeacher.id,
            room: 'Room 101',
            maxStudents: 30,
            currentStudents: 0,
        },
    });
    const class10B = await prisma.class.create({
        data: {
            schoolId: school.id,
            code: '10B',
            name: 'Class 10B',
            gradeLevel: 10,
            academicYear: '2024-2025',
            homeroomTeacherId: scienceTeacher.id,
            room: 'Room 102',
            maxStudents: 30,
            currentStudents: 0,
        },
    });
    console.log(`✅ Created classes`);
    const student1 = await prisma.student.create({
        data: {
            schoolId: school.id,
            classId: class10A.id,
            code: 'STU001',
            fullName: 'Alice Student',
            dateOfBirth: new Date('2008-05-15'),
            gender: 'FEMALE',
            status: 'ACTIVE',
            email: 'alice.student@edumanager.demo',
            phone: '+1-555-0201',
            address: '123 Student Street, Student City, SC 20001',
            parentId: parent.id,
            emergencyContact: {
                name: 'Emergency Contact',
                relationship: 'Guardian',
                phone: '+1-555-9999',
            },
        },
    });
    const student2 = await prisma.student.create({
        data: {
            schoolId: school.id,
            classId: class10A.id,
            code: 'STU002',
            fullName: 'Bob Student',
            dateOfBirth: new Date('2008-08-22'),
            gender: 'MALE',
            status: 'ACTIVE',
            email: 'bob.student@edumanager.demo',
            phone: '+1-555-0202',
            address: '456 Student Street, Student City, SC 20002',
            parentId: parent.id,
            emergencyContact: {
                name: 'Emergency Contact',
                relationship: 'Guardian',
                phone: '+1-555-9998',
            },
        },
    });
    const student3 = await prisma.student.create({
        data: {
            schoolId: school.id,
            classId: class10B.id,
            code: 'STU003',
            fullName: 'Charlie Student',
            dateOfBirth: new Date('2008-03-10'),
            gender: 'MALE',
            status: 'ACTIVE',
            email: 'charlie.student@edumanager.demo',
            phone: '+1-555-0203',
            address: '789 Student Street, Student City, SC 20003',
            parentId: parent.id,
            emergencyContact: {
                name: 'Emergency Contact',
                relationship: 'Guardian',
                phone: '+1-555-9997',
            },
        },
    });
    console.log(`✅ Created students`);
    await prisma.class.update({
        where: { id: class10A.id },
        data: { currentStudents: 2 },
    });
    await prisma.class.update({
        where: { id: class10B.id },
        data: { currentStudents: 1 },
    });
    const schedule1 = await prisma.schedule.create({
        data: {
            classId: class10A.id,
            subjectId: mathSubject.id,
            teacherId: mathTeacher.id,
            dayOfWeek: 1,
            period: 1,
            room: 'Room 101',
            semester: 'Fall',
            academicYear: '2024-2025',
        },
    });
    const schedule2 = await prisma.schedule.create({
        data: {
            classId: class10A.id,
            subjectId: scienceSubject.id,
            teacherId: scienceTeacher.id,
            dayOfWeek: 1,
            period: 2,
            room: 'Room 102',
            semester: 'Fall',
            academicYear: '2024-2025',
        },
    });
    const schedule3 = await prisma.schedule.create({
        data: {
            classId: class10A.id,
            subjectId: englishSubject.id,
            teacherId: mathTeacher.id,
            dayOfWeek: 2,
            period: 1,
            room: 'Room 103',
            semester: 'Fall',
            academicYear: '2024-2025',
        },
    });
    console.log(`✅ Created schedules`);
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   🏫 Schools: 1`);
    console.log(`   👥 Users: 4 (1 Admin, 2 Teachers, 1 Parent)`);
    console.log(`   👨‍🎓 Students: 3`);
    console.log(`   📚 Classes: 2`);
    console.log(`   📖 Subjects: 3`);
    console.log(`   📅 Schedules: 3`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Admin: admin@edumanager.demo / admin123`);
    console.log(`   Teacher: math.teacher@edumanager.demo / teacher123`);
    console.log(`   Teacher: science.teacher@edumanager.demo / teacher123`);
    console.log(`   Parent: parent@edumanager.demo / parent123`);
    console.log('\n🚀 Ready to test the API!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map