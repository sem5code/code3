# 🚀 Redis-Powered Real-Time Notification System

This guide helps you set up **Redis** locally (on Ubuntu/Debian Linux) and run a simple **Node.js + Socket.IO real-time notification system**.

---

## 🧩 Prerequisites

- Ubuntu/Debian-based Linux system 🐧  
- Node.js (v16 or later) and npm  
- Redis server  
- Internet access  

---

## ⚙️ Step 1: Install Redis Server

Run the following commands in your terminal:

```bash
sudo apt update
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server



npm install



Make sure Redis is running (redis-cli ping returns PONG).


Then start the Node.js server:

node server.js


Output should show:

✅ Server running at http://localhost:3000

🌐 Step 8: Test in Browser

Open two tabs in your browser:

Tab 1 → http://localhost:3000
 → enter user ID: 1

Tab 2 → http://localhost:3000
 → enter user ID: 2

In Tab 1, send a message to user 2.

You’ll instantly see the 🔔 notification in Tab 2 (real-time update via Redis + Socket.IO).
