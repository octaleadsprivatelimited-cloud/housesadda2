# Quick Fix for Login Issues

## Step-by-Step Fix

### 1. Create .env File

Create a `.env` file in the root directory with:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=housesadda
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

**Important:** Replace `DB_PASSWORD=` with your MySQL password if you have one set.

### 2. Make Sure MySQL is Running

**Windows:**
- Open Services (Win+R, type `services.msc`)
- Find "MySQL" and make sure it's running
- Or check XAMPP/WAMP control panel

**Mac/Linux:**
```sh
sudo systemctl status mysql
# If not running:
sudo systemctl start mysql
```

### 3. Create Database (if not exists)

Open MySQL command line or MySQL Workbench:

```sql
CREATE DATABASE IF NOT EXISTS housesadda;
```

### 4. Import Database Schema

```sh
mysql -u root -p housesadda < database/schema.sql
```

Or in MySQL Workbench:
- File → Run SQL Script
- Select `database/schema.sql`

### 5. Set Up Admin User

Run this command to create/update the admin user:

```sh
npm run setup:admin
```

This will:
- Create admin user with username: `admin`
- Set password: `admin123`
- Generate correct password hash

### 6. Start Backend Server

In one terminal:
```sh
npm run dev:server
```

You should see:
```
✅ Connected to MySQL database
🚀 Server running on http://localhost:3001
```

### 7. Start Frontend (in another terminal)

```sh
npm run dev
```

### 8. Try Login

Go to: http://localhost:8080/admin

- **Username:** `admin`
- **Password:** `admin123`

## Common Errors

### "Cannot connect to server"
- Backend server is not running
- Run: `npm run dev:server`

### "Invalid credentials"
- Admin user doesn't exist in database
- Run: `npm run setup:admin`

### "Database connection error"
- MySQL is not running
- Check `.env` file has correct credentials
- Verify database `housesadda` exists

### "Module not found"
- Dependencies not installed
- Run: `npm install`

## Verify Everything Works

1. Check backend is running: http://localhost:3001/api/health
   - Should return: `{"status":"ok","message":"Server is running"}`

2. Check database connection:
   ```sh
   mysql -u root -p -e "USE housesadda; SELECT * FROM admin_users;"
   ```
   - Should show admin user with a password hash

3. Check browser console (F12) for errors

## Still Having Issues?

Check `TROUBLESHOOTING.md` for detailed solutions.

