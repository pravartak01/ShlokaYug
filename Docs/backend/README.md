# ShlokaYug Backend Documentation

## Overview
Backend documentation for the ShlokaYug Sanskrit learning platform with advanced chandas analysis, real-time karaoke chanting, AI-powered features, and community functionality.

## Table of Contents
1. [Architecture Overview](./architecture.md)
2. [API Documentation](./api/README.md)
3. [Database Schema](./database/schema.md)
4. [AI Integration](./ai/README.md)
5. [Audio Processing](./audio/README.md)
6. [Authentication & Security](./auth/README.md)
7. [Deployment Guide](./deployment.md)
8. [Development Setup](./setup.md)

## Quick Start
Refer to [Development Setup](./setup.md) for local development environment configuration.

## Core Features Implemented
- [x] Chandas (Meter) Analysis Engine
- [x] Real-time Karaoke Timeline Generation  
- [x] Audio-to-Meter Detection Service
- [x] Multi-Script Input Support (IAST conversion)
- [x] AI Composer Mode (Gemini Integration)
- [x] User Authentication & Profile Management
- [x] Community Features (Upload, Search, Moderation)
- [x] Gamification System (XP, Badges, Streaks)
- [x] Guru-Shishya Mode (LMS functionality)
- [x] Live Session Management
- [x] Festival-wise Recommendations
- [x] Quiz & Certificate System

## Technology Stack
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gemini API
- **Audio Processing**: FFmpeg, Web Audio API
- **File Storage**: Cloudinary/AWS S3
- **Authentication**: JWT + Passport.js
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI 3.0