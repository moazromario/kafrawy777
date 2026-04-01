import { io } from "socket.io-client";

// In development, the socket server is the same as the dev server
const socket = io();

export default socket;
