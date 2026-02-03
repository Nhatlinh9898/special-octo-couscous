import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/asyncHandler';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Middleware
router.use(authenticate);

// Get all KTX rooms
router.get('/rooms',
  authorize(['ADMIN', 'MANAGER']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['Available', 'Occupied', 'Maintenance', 'Cleaning', 'Reserved']),
  query('area').optional().isIn(['A', 'B']),
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { page = 1, limit = 20, status, area, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) where.status = status;
    if (area) where.area = area;
    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [rooms, total] = await Promise.all([
      prisma.ktxRoom.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          students: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          utilityBills: {
            select: {
              id: true,
              month: true,
              year: true,
              totalAmount: true,
              status: true
            },
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        },
        orderBy: { roomNumber: 'asc' }
      }),
      prisma.ktxRoom.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  })
);

// Get KTX room by ID
router.get('/rooms/:id',
  authorize(['ADMIN', 'MANAGER', 'STUDENT']),
  param('id').isInt(),
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { id } = req.params;

    const room = await prisma.ktxRoom.findUnique({
      where: { id: Number(id) },
      include: {
        students: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            checkInDate: true,
            checkOutDate: true,
            status: true
          }
        },
        utilityBills: {
          include: {
            meterReadings: {
              orderBy: { readingDate: 'desc' },
              take: 2
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        maintenanceRecords: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: { message: 'KTX room not found' }
      });
    }

    res.json({
      success: true,
      data: room
    });
  })
);

// Create KTX room
router.post('/rooms',
  authorize(['ADMIN', 'MANAGER']),
  [
    body('roomNumber').notEmpty().withMessage('Room number is required'),
    body('area').isIn(['A', 'B']).withMessage('Area must be A or B'),
    body('floor').isInt({ min: 1, max: 10 }).withMessage('Floor must be between 1 and 10'),
    body('capacity').isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10'),
    body('type').isIn(['Standard', 'Premium', 'VIP']).withMessage('Invalid room type'),
    body('price').isInt({ min: 0 }).withMessage('Price must be non-negative'),
    body('electricityRate').isInt({ min: 0 }).withMessage('Electricity rate must be non-negative'),
    body('waterRate').isInt({ min: 0 }).withMessage('Water rate must be non-negative')
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const {
      roomNumber,
      area,
      floor,
      capacity,
      type,
      price,
      electricityRate,
      waterRate,
      facilities,
      description
    } = req.body;

    // Check if room number already exists
    const existingRoom = await prisma.ktxRoom.findFirst({
      where: { roomNumber }
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        error: { message: 'Room number already exists' }
      });
    }

    const room = await prisma.ktxRoom.create({
      data: {
        roomNumber,
        area,
        floor,
        capacity,
        type,
        price,
        electricityRate,
        waterRate,
        facilities: facilities || [],
        description: description || '',
        currentOccupancy: 0,
        status: 'Available'
      },
      include: {
        students: true,
        utilityBills: true
      }
    });

    res.status(201).json({
      success: true,
      data: room,
      message: 'KTX room created successfully'
    });
  })
);

// Update KTX room
router.put('/rooms/:id',
  authorize(['ADMIN', 'MANAGER']),
  param('id').isInt(),
  [
    body('roomNumber').optional().notEmpty(),
    body('area').optional().isIn(['A', 'B']),
    body('floor').optional().isInt({ min: 1, max: 10 }),
    body('capacity').optional().isInt({ min: 1, max: 10 }),
    body('type').optional().isIn(['Standard', 'Premium', 'VIP']),
    body('status').optional().isIn(['Available', 'Occupied', 'Maintenance', 'Cleaning', 'Reserved']),
    body('price').optional().isInt({ min: 0 }),
    body('electricityRate').optional().isInt({ min: 0 }),
    body('waterRate').optional().isInt({ min: 0 })
  ],
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if room exists
    const existingRoom = await prisma.ktxRoom.findUnique({
      where: { id: Number(id) }
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        error: { message: 'KTX room not found' }
      });
    }

    // If updating room number, check for duplicates
    if (updateData.roomNumber && updateData.roomNumber !== existingRoom.roomNumber) {
      const duplicateRoom = await prisma.ktxRoom.findFirst({
        where: { roomNumber: updateData.roomNumber }
      });

      if (duplicateRoom) {
        return res.status(400).json({
          success: false,
          error: { message: 'Room number already exists' }
        });
      }
    }

    const room = await prisma.ktxRoom.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        students: true,
        utilityBills: true
      }
    });

    res.json({
      success: true,
      data: room,
      message: 'KTX room updated successfully'
    });
  })
);

// Delete KTX room
router.delete('/rooms/:id',
  authorize(['ADMIN', 'MANAGER']),
  param('id').isInt(),
  asyncHandler(async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { id } = req.params;

    // Check if room exists
    const existingRoom = await prisma.ktxRoom.findUnique({
      where: { id: Number(id) },
      include: {
        students: true
      }
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        error: { message: 'KTX room not found' }
      });
    }

    // Check if room has students
    if (existingRoom.students.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete room with assigned students' }
      });
    }

    await prisma.ktxRoom.delete({
      where: { id: Number(id) }
    });

    res.json({
      success: true,
      message: 'KTX room deleted successfully'
    });
  })
);

// Get KTX statistics
router.get('/statistics',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req: any, res: any) => {
    const [
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      totalStudents,
      totalUtilityBills,
      unpaidBills,
      monthlyRevenue
    ] = await Promise.all([
      prisma.ktxRoom.count(),
      prisma.ktxRoom.count({ where: { status: 'Occupied' } }),
      prisma.ktxRoom.count({ where: { status: 'Available' } }),
      prisma.ktxRoom.count({ where: { status: 'Maintenance' } }),
      prisma.student.count({
        where: {
          roomNumber: { not: null },
          status: 'Active'
        }
      }),
      prisma.utilityBill.count(),
      prisma.utilityBill.count({ where: { status: 'Unpaid' } }),
      prisma.utilityBill.aggregate({
        where: {
          status: 'Paid',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { totalAmount: true }
      })
    ]);

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        maintenanceRooms,
        totalStudents,
        totalUtilityBills,
        unpaidBills,
        monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
        occupancyRate: Math.round(occupancyRate * 100) / 100
      }
    });
  })
);

export default router;
