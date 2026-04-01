// KafrawyGo Professional Backend
// Optimized for Scalability and Real-time performance

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// --- Types & Interfaces ---
interface Location {
  lat: number;
  lng: number;
}

interface Driver {
  socketId: string;
  name: string;
  rating: number;
  car: string;
  lastLocation?: Location;
  status: 'online' | 'offline' | 'busy';
}

interface RideOffer {
  driverId: string;
  driverName: string;
  driverRating: number;
  car: string;
  price: number;
  timestamp: Date;
}

interface Ride {
  id: string;
  userSocketId: string;
  pickup: string;
  destination: string;
  pickupCoords: Location;
  destinationCoords: Location;
  status: 'searching' | 'matched' | 'active' | 'completed' | 'cancelled';
  serviceType: string;
  suggestedPrice: number;
  finalPrice?: number;
  distance?: number;
  duration?: number;
  matchedDriverId?: string;
  offers: RideOffer[];
  createdAt: Date;
}

// --- Ride Manager (Business Logic) ---
class RideManager {
  private drivers = new Map<string, Driver>();
  private rides = new Map<string, Ride>();
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Rehydration: Load active rides from DB on startup
  async rehydrate() {
    console.log("[RideManager] Rehydrating active rides from Supabase...");
    const { data, error } = await this.supabase
      .from('rides')
      .select('*')
      .in('status', ['searching', 'matched', 'active']);

    if (error) {
      console.error("[RideManager] Rehydration error:", error);
      return;
    }

    if (data) {
      data.forEach(r => {
        // Map DB columns to Ride interface
        const ride: Ride = {
          id: r.id,
          userSocketId: r.user_id, // Note: In production, this would be mapped to a real socket session
          pickup: r.pickup_address,
          destination: r.destination_address,
          pickupCoords: { lat: Number(r.pickup_lat), lng: Number(r.pickup_lng) },
          destinationCoords: { lat: Number(r.destination_lat), lng: Number(r.destination_lng) },
          status: r.status,
          serviceType: r.service_type,
          suggestedPrice: Number(r.suggested_price),
          finalPrice: r.final_price ? Number(r.final_price) : undefined,
          distance: r.distance_km ? Number(r.distance_km) : undefined,
          duration: r.duration_min ? Number(r.duration_min) : undefined,
          matchedDriverId: r.driver_id,
          offers: [],
          createdAt: new Date(r.created_at)
        };
        this.rides.set(ride.id, ride);
      });
      console.log(`[RideManager] Successfully rehydrated ${data.length} rides.`);
    }
  }

  // Driver Management
  setDriverOnline(socketId: string, data: any) {
    this.drivers.set(socketId, {
      ...data,
      socketId,
      status: 'online',
      lastLocation: data.location
    });
  }

  setDriverOffline(socketId: string) {
    this.drivers.delete(socketId);
  }

  updateDriverLocation(socketId: string, location: Location) {
    const driver = this.drivers.get(socketId);
    if (driver) {
      driver.lastLocation = location;
    }
  }

  getOnlineDrivers() {
    return Array.from(this.drivers.values());
  }

  // Ride Management
  async createRide(userSocketId: string, data: any): Promise<Ride> {
    const rideId = `ride_${Date.now()}`;
    const ride: Ride = {
      id: rideId,
      userSocketId,
      ...data,
      status: 'searching',
      offers: [],
      createdAt: new Date()
    };
    
    this.rides.set(rideId, ride);

    // Sync to Supabase (Critical Data)
    // Note: We use a dummy UUID if userSocketId isn't a valid UUID for this demo
    const userId = userSocketId.length === 36 ? userSocketId : "00000000-0000-0000-0000-000000000000";
    
    await this.supabase.from('rides').insert({
      id: rideId.startsWith('ride_') ? undefined : rideId, // Let DB generate UUID if it's our mock string
      user_id: userId,
      service_type: ride.serviceType,
      pickup_address: ride.pickup,
      pickup_lat: ride.pickupCoords.lat,
      pickup_lng: ride.pickupCoords.lng,
      destination_address: ride.destination,
      destination_lat: ride.destinationCoords.lat,
      destination_lng: ride.destinationCoords.lng,
      suggested_price: ride.suggestedPrice,
      status: 'searching'
    });

    return ride;
  }

  getRide(rideId: string) {
    return this.rides.get(rideId);
  }

  async addOffer(rideId: string, driverSocketId: string, price: number): Promise<{ ride: Ride, offer: RideOffer } | null> {
    const ride = this.rides.get(rideId);
    const driver = this.drivers.get(driverSocketId);
    
    if (ride && driver && ride.status === 'searching') {
      const offer: RideOffer = {
        driverId: driverSocketId,
        driverName: driver.name,
        driverRating: driver.rating,
        car: driver.car,
        price,
        timestamp: new Date()
      };
      ride.offers.push(offer);

      // Sync Offer to DB
      await this.supabase.from('ride_offers').insert({
        ride_id: rideId,
        driver_id: driverSocketId.length === 36 ? driverSocketId : undefined, // Mocking UUID
        offered_price: price,
        status: 'pending'
      });

      return { ride, offer };
    }
    return null;
  }

  async matchRide(rideId: string, driverSocketId: string): Promise<Ride | null> {
    const ride = this.rides.get(rideId);
    if (ride && ride.status === 'searching') {
      ride.status = 'matched';
      ride.matchedDriverId = driverSocketId;
      
      // Mark driver as busy
      const driver = this.drivers.get(driverSocketId);
      if (driver) driver.status = 'busy';

      // Sync Match to DB
      await this.supabase.from('rides')
        .update({ 
          status: 'matched', 
          driver_id: driverSocketId.length === 36 ? driverSocketId : undefined,
          matched_at: new Date().toISOString()
        })
        .eq('id', rideId);
      
      return ride;
    }
    return null;
  }

  async completeRide(rideId: string): Promise<Ride | null> {
    const ride = this.rides.get(rideId);
    if (ride) {
      ride.status = 'completed';
      
      // Free up the driver
      if (ride.matchedDriverId) {
        const driver = this.drivers.get(ride.matchedDriverId);
        if (driver) driver.status = 'online';
      }
      
      // Sync Completion to DB
      await this.supabase.from('rides')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', rideId);

      this.rides.delete(rideId);
      return ride;
    }
    return null;
  }

  async cancelRide(rideId: string, cancelledBy: string): Promise<Ride | null> {
    const ride = this.rides.get(rideId);
    if (ride) {
      ride.status = 'cancelled';
      
      // Free up the driver if matched
      if (ride.matchedDriverId) {
        const driver = this.drivers.get(ride.matchedDriverId);
        if (driver) driver.status = 'online';
      }
      
      // Sync Cancellation to DB
      await this.supabase.from('rides')
        .update({ 
          status: 'cancelled',
          // We could add a cancelled_by column, but for now we just update status
        })
        .eq('id', rideId);

      this.rides.delete(rideId);
      return ride;
    }
    return null;
  }

  getSearchingRides() {
    return Array.from(this.rides.values()).filter(r => r.status === 'searching');
  }
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  const PORT = 3000;

  // Initialize Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const rideManager = new RideManager(supabase);
  
  // Rehydrate state from DB
  await rideManager.rehydrate();

  app.use(express.json());

  // --- REST API ---
  app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));
  
  app.get("/api/drivers", (req, res) => res.json(rideManager.getOnlineDrivers()));
  
  app.get("/api/rides/active", (req, res) => res.json(rideManager.getSearchingRides()));

  // --- Socket.io Real-time Logic ---
  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Driver Events
    socket.on("driver_online", (data) => {
      rideManager.setDriverOnline(socket.id, data);
      console.log(`[Driver] Online: ${data.name}`);
      
      // Sync state
      socket.emit("active_rides_list", rideManager.getSearchingRides());
      io.emit("drivers_update", rideManager.getOnlineDrivers());
    });

    socket.on("driver_location_sync", (location) => {
      rideManager.updateDriverLocation(socket.id, location);
      io.emit("drivers_update", rideManager.getOnlineDrivers());
    });

    socket.on("driver_offline", () => {
      rideManager.setDriverOffline(socket.id);
      io.emit("drivers_update", rideManager.getOnlineDrivers());
      console.log(`[Driver] Offline: ${socket.id}`);
    });

    // Ride Lifecycle
    socket.on("request_ride", async (data) => {
      const ride = await rideManager.createRide(socket.id, data);
      console.log(`[Ride] New Request: ${ride.id}`);
      
      // Broadcast to all online drivers
      io.emit("new_ride_request", ride);
    });

    socket.on("driver_response", async ({ rideId, price }) => {
      const result = await rideManager.addOffer(rideId, socket.id, price);
      if (result) {
        // Notify the user about the new offer
        io.to(result.ride.userSocketId).emit("ride_response", { 
          rideId, 
          response: result.offer 
        });
        console.log(`[Offer] Driver ${socket.id} offered ${price} for ride ${rideId}`);
      }
    });

    socket.on("select_driver", async ({ rideId, driverSocketId }) => {
      const ride = await rideManager.matchRide(rideId, driverSocketId);
      if (ride) {
        io.to(driverSocketId).emit("ride_matched", ride);
        io.to(ride.userSocketId).emit("ride_confirmed", ride);
        console.log(`[Match] Ride ${rideId} matched with driver ${driverSocketId}`);
      }
    });

    // Real-time Tracking
    socket.on("driver_location_update", ({ rideId, lat, lng, distance, eta }) => {
      const ride = rideManager.getRide(rideId);
      if (ride) {
        io.to(ride.userSocketId).emit("ride_update", {
          rideId,
          location: { lat, lng, distance, eta },
          timestamp: new Date()
        });
      }
    });

    // Communication
    socket.on("send_message", async ({ rideId, message, senderId }) => {
      const ride = rideManager.getRide(rideId);
      if (ride) {
        const recipientId = senderId === ride.userSocketId ? ride.matchedDriverId : ride.userSocketId;
        
        // Persist message to Supabase
        await supabase.from('ride_messages').insert({
          ride_id: rideId,
          sender_id: senderId.length === 36 ? senderId : undefined, // Mock UUID
          message: message
        });

        if (recipientId) {
          io.to(recipientId).emit("receive_message", {
            rideId, message, senderId, timestamp: new Date()
          });
        }
      }
    });

    socket.on("get_chat_history", async (rideId) => {
      // Fetch chat history from Supabase
      const { data, error } = await supabase
        .from('ride_messages')
        .select('*')
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const history = data.map(msg => ({
          text: msg.message,
          senderId: msg.sender_id || 'unknown',
          timestamp: new Date(msg.created_at)
        }));
        socket.emit("chat_history", { rideId, history });
      }
    });

    socket.on("end_ride", async (rideId) => {
      const ride = await rideManager.completeRide(rideId);
      if (ride) {
        io.to(ride.userSocketId).emit("ride_completed", rideId);
        console.log(`[Ride] Completed: ${rideId}`);
      }
    });

    socket.on("cancel_ride", async ({ rideId, cancelledBy }) => {
      const ride = await rideManager.cancelRide(rideId, cancelledBy);
      if (ride) {
        // Notify both parties
        io.to(ride.userSocketId).emit("ride_cancelled", { rideId, cancelledBy });
        if (ride.matchedDriverId) {
          io.to(ride.matchedDriverId).emit("ride_cancelled", { rideId, cancelledBy });
        }
        console.log(`[Ride] Cancelled: ${rideId} by ${cancelledBy}`);
      }
    });

    socket.on("disconnect", () => {
      rideManager.setDriverOffline(socket.id);
      io.emit("drivers_update", rideManager.getOnlineDrivers());
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  // --- Vite / Static Files ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] KafrawyGo Backend running on port ${PORT}`);
  });
}

startServer();
