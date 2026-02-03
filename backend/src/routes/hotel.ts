import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/asyncHandler';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Middleware
router.use(authenticate);

// Get all hotel rooms
router.get('/rooms',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req: any, res: any) => {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [rooms, total] = await Promise.all([
      prisma.hotelRoom.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          bookings: {
            where: {
              status: { in: ['Confirmed', 'CheckedIn'] }
            },
            orderBy: { checkInDate: 'desc' },
            take: 3
          },
          housekeeping: {
            orderBy: { scheduledDate: 'desc' },
            take: 3
          }
        },
        orderBy: { roomNumber: 'asc' }
      }),
      prisma.hotelRoom.count({ where })
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

// Get hotel room by ID
router.get('/rooms/:id',
  authorize(['ADMIN', 'MANAGER', 'STAFF']),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const room = await prisma.hotelRoom.findUnique({
      where: { id: Number(id) },
      include: {
        bookings: {
          orderBy: { checkInDate: 'desc' }
        },
        housekeeping: {
          orderBy: { scheduledDate: 'desc' }
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel room not found' }
      });
    }

    res.json({
      success: true,
      data: room
    });
  })
);

// Create hotel room
router.post('/rooms',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req: any, res: any) => {
    const {
      roomNumber,
      floor,
      capacity,
      type,
      pricePerNight,
      amenities,
      description
    } = req.body;

    // Check if room number already exists
    const existingRoom = await prisma.hotelRoom.findFirst({
      where: { roomNumber }
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        error: { message: 'Room number already exists' }
      });
    }

    const room = await prisma.hotelRoom.create({
      data: {
        roomNumber,
        floor,
        capacity,
        type,
        pricePerNight,
        amenities: amenities || [],
        description: description || '',
        status: 'Available'
      },
      include: {
        bookings: true,
        housekeeping: true
      }
    });

    res.status(201).json({
      success: true,
      data: room,
      message: 'Hotel room created successfully'
    });
  })
);

// Update hotel room
router.put('/rooms/:id',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if room exists
    const existingRoom = await prisma.hotelRoom.findUnique({
      where: { id: Number(id) }
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel room not found' }
      });
    }

    // If updating room number, check for duplicates
    if (updateData.roomNumber && updateData.roomNumber !== existingRoom.roomNumber) {
      const duplicateRoom = await prisma.hotelRoom.findFirst({
        where: { roomNumber: updateData.roomNumber }
      });

      if (duplicateRoom) {
        return res.status(400).json({
          success: false,
          error: { message: 'Room number already exists' }
        });
      }
    }

    const room = await prisma.hotelRoom.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        bookings: true,
        housekeeping: true
      }
    });

    res.json({
      success: true,
      data: room,
      message: 'Hotel room updated successfully'
    });
  })
);

// Delete hotel room
router.delete('/rooms/:id',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    // Check if room exists
    const existingRoom = await prisma.hotelRoom.findUnique({
      where: { id: Number(id) },
      include: {
        bookings: true
      }
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel room not found' }
      });
    }

    // Check if room has active bookings
    const activeBookings = existingRoom.bookings.filter(
      booking => ['Confirmed', 'CheckedIn'].includes(booking.status)
    );

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete room with active bookings' }
      });
    }

    await prisma.hotelRoom.delete({
      where: { id: Number(id) }
    });

    res.json({
      success: true,
      message: 'Hotel room deleted successfully'
    });
  })
);

// Get all bookings
router.get('/bookings',
  authorize(['ADMIN', 'MANAGER', 'STAFF']),
  asyncHandler(async (req: any, res: any) => {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { guestPhone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          room: {
            select: {
              id: true,
              roomNumber: true,
              type: true,
              pricePerNight: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        bookings,
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

// Create booking
router.post('/bookings',
  authorize(['ADMIN', 'MANAGER', 'STAFF']),
  asyncHandler(async (req: any, res: any) => {
    const {
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      adults,
      children,
      specialRequests
    } = req.body;

    // Check if room exists
    const room = await prisma.hotelRoom.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel room not found' }
      });
    }

    // Check room availability
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { in: ['Confirmed', 'CheckedIn'] },
        OR: [
          {
            checkInDate: { lte: new Date(checkOutDate) },
            checkOutDate: { gte: new Date(checkInDate) }
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        error: { message: 'Room is not available for the selected dates' }
      });
    }

    // Calculate total amount
    const nights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.pricePerNight;

    const booking = await prisma.booking.create({
      data: {
        roomId,
        guestName,
        guestEmail,
        guestPhone,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        adults: adults || 1,
        children: children || 0,
        totalAmount,
        specialRequests: specialRequests || '',
        status: 'Confirmed'
      },
      include: {
        room: true
      }
    });

    // Update room status
    await prisma.hotelRoom.update({
      where: { id: roomId },
      data: { status: 'Reserved' }
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  })
);

// Check-in guest
router.post('/bookings/:id/checkin',
  authorize(['ADMIN', 'MANAGER', 'STAFF']),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: { room: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        error: { message: 'Only confirmed bookings can be checked in' }
      });
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: Number(id) },
      data: { status: 'CheckedIn' }
    });

    // Update room status
    await prisma.hotelRoom.update({
      where: { id: booking.roomId },
      data: { status: 'Occupied' }
    });

    res.json({
      success: true,
      message: 'Guest checked in successfully'
    });
  })
);

// Check-out guest
router.post('/bookings/:id/checkout',
  authorize(['ADMIN', 'MANAGER', 'STAFF']),
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: { room: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    if (booking.status !== 'CheckedIn') {
      return res.status(400).json({
        success: false,
        error: { message: 'Only checked-in guests can be checked out' }
      });
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: Number(id) },
      data: { status: 'CheckedOut' }
    });

    // Update room status and last cleaned
    await prisma.hotelRoom.update({
      where: { id: booking.roomId },
      data: { 
        status: 'Cleaning',
        lastCleaned: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Guest checked out successfully'
    });
  })
);

// Get hotel statistics
router.get('/statistics',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req: any, res: any) => {
    const [
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      totalBookings,
      activeBookings,
      todayCheckins,
      todayCheckouts,
      monthlyRevenue
    ] = await Promise.all([
      prisma.hotelRoom.count(),
      prisma.hotelRoom.count({ where: { status: 'Occupied' } }),
      prisma.hotelRoom.count({ where: { status: 'Available' } }),
      prisma.hotelRoom.count({ where: { status: 'Maintenance' } }),
      prisma.booking.count(),
      prisma.booking.count({ 
        where: { status: { in: ['Confirmed', 'CheckedIn'] } }
      }),
      prisma.booking.count({
        where: {
          status: 'CheckedIn',
          checkInDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.booking.count({
        where: {
          status: 'CheckedOut',
          checkOutDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.booking.aggregate({
        where: {
          status: 'CheckedOut',
          checkOutDate: {
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
        totalBookings,
        activeBookings,
        todayCheckins,
        todayCheckouts,
        monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
        occupancyRate: Math.round(occupancyRate * 100) / 100
      }
    });
  })
);

export default router;
