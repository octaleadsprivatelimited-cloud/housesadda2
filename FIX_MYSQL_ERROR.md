# Fix: Internal Server Error - MySQL Connection Issue

## Problem
The error "ECONNREFUSED" means MySQL server is not running or not accessible.

## Solution Steps

### Step 1: Check if MySQL is Installed

**Windows:**
- Check if you have XAMPP, WAMP, or MySQL installed
- Look in Programs or Services

**If MySQL is NOT installed:**
- Download XAMPP: https://www.apachefriends.org/
- Or MySQL: https://dev.mysql.com/downloads/installer/

### Step 2: Start MySQL Server

**If using XAMPP:**
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL
3. Wait until it shows "Running" (green)

**If using WAMP:**
1. Open WAMP Control Panel
2. Click "Start All Services"
3. MySQL should start automatically

**If MySQL is installed separately:**
1. Open Services (Win+R, type `services.msc`)
2. Find "MySQL" or "MySQL80"
3. Right-click → Start

**Command line (if MySQL is in PATH):**
```sh
# Windows
net start MySQL

# Or
mysqld --console
```

### Step 3: Verify MySQL is Running

Test the connection:
```sh
npm run test:db
```

You should see: `✅ Successfully connected to MySQL!`

### Step 4: Create Database

Open MySQL command line or MySQL Workbench:

**Option 1: Command Line**
```sh
mysql -u root -p
```
Then type:
```sql
CREATE DATABASE housesadda;
EXIT;
```

**Option 2: MySQL Workbench**
- Connect to MySQL
- Run: `CREATE DATABASE housesadda;`

### Step 5: Import Schema

```sh
mysql -u root -p housesadda < database/schema.sql
```

Or in MySQL Workbench:
- File → Run SQL Script
- Select `database/schema.sql`

### Step 6: Create Admin User

```sh
npm run setup:admin
```

### Step 7: Restart Backend Server

Stop the current server (Ctrl+C) and restart:
```sh
npm run dev:server
```

You should now see:
```
✅ Connected to MySQL database
🚀 Server running on http://localhost:3001
```

## Quick Checklist

- [ ] MySQL server is running
- [ ] Database "housesadda" exists
- [ ] Schema imported (tables created)
- [ ] Admin user created (`npm run setup:admin`)
- [ ] Backend server restarted

## Still Having Issues?

1. **Check MySQL Port:**
   - Default is 3306
   - Make sure no firewall is blocking it

2. **Check .env file:**
   - DB_HOST=localhost
   - DB_USER=root
   - DB_PASSWORD= (your MySQL password if set)
   - DB_NAME=housesadda

3. **Test MySQL directly:**
   ```sh
   mysql -u root -p -e "SHOW DATABASES;"
   ```

4. **Check if MySQL is listening:**
   ```sh
   netstat -ano | findstr :3306
   ```

