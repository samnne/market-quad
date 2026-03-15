"use client";
import 'dotenv/config'
import { io } from "socket.io-client";

export const socket = io();

