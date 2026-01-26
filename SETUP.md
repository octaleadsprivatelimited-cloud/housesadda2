# MySQL Setup Guide for HousesAdda

## Step 1: Install MySQL

If you don't have MySQL installed:

**Windows:**
- Download from: https://dev.mysql.com/downloads/installer/
- Or use XAMPP/WAMP which includes MySQL

**Mac:**
```sh
brew install mysql
brew services start mysql
```

**Linux:**
```sh
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

## Step 2: Create Database

1. Open MySQL command line or MySQL Workbench
2. Login to MySQL:
```sh
mysql -u root -p
```

3. Create the database:
```sql
CREATE DATABASE housesadda;
```

4. Exit MySQL:
```sql
EXIT;
```

## Step 3: Import Database Schema

Run the schema file:

```sh
mysql -u root -p housesadda < database/schema.sql
```

Or in MySQL Workbench:
- File → Run SQL Script
- Select `database/schema.sql`

## Step 4: Create Admin User Password Hash

After installing npm dependencies, run:

```sh
node database/create-admin.js
```

This will generate a bcrypt hash. Then update the admin user in the database:

```sql
USE housesadda;
UPDATE admin_users SET password = '<generated_hash>' WHERE username = 'admin';
```

Or manually insert:
```sql
INSERT INTO admin_users (username, password) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON DUPLICATE KEY UPDATE password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
```

**Default credentials:**
- Username: `admin`
- Password: `admin123`

## Step 5: Configure Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=housesadda
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

## Step 6: Install Dependencies

```sh
npm install
```

## Step 7: Start the Application

Start both frontend and backend:

```sh
npm run dev:all
```

Or separately:

**Terminal 1 (Frontend):**
```sh
npm run dev
```

**Terminal 2 (Backend):**
```sh
npm run dev:server
```

## Step 8: Access the Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3001
- **Admin Panel:** http://localhost:8080/admin

## Troubleshooting

### Database Connection Error

1. Check MySQL is running:
   - Windows: Check Services
   - Mac/Linux: `sudo systemctl status mysql`

2. Verify credentials in `.env` file

3. Test connection:
```sh
mysql -u root -p -e "USE housesadda; SHOW TABLES;"
```

### Port Already in Use

If port 3001 is in use, change `PORT` in `.env` file

### Admin Login Not Working

1. Verify admin user exists:
```sql
SELECT * FROM admin_users;
```

2. Regenerate password hash and update database

3. Check JWT_SECRET is set in `.env`

## Database Structure

The schema creates these tables:
- `admin_users` - Admin authentication
- `properties` - Property listings
- `property_types` - Types (Apartment, Villa, etc.)
- `locations` - Areas and cities
- `property_images` - Property image URLs

## Next Steps

1. Change default admin password
2. Add your first property through admin panel
3. Configure locations and property types as needed

