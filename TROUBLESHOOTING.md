# Troubleshooting Login Issues

## Common Issues and Solutions

### 1. Backend Server Not Running

**Symptom:** Login fails with network error or "Request failed"

**Solution:**
- Make sure the backend server is running:
  ```sh
  npm run dev:server
  ```
- Check if port 3001 is available
- Look for errors in the terminal

### 2. Database Not Set Up

**Symptom:** "Internal server error" or database connection errors

**Solution:**
1. Create the database:
   ```sql
   CREATE DATABASE housesadda;
   ```

2. Import the schema:
   ```sh
   mysql -u root -p housesadda < database/schema.sql
   ```

3. Run the admin setup script:
   ```sh
   npm run setup:admin
   ```

### 3. Admin User Not Created

**Symptom:** "Invalid credentials" even with correct username/password

**Solution:**
Run the setup script to create/update admin user:
```sh
npm run setup:admin
```

This will:
- Create the admin user if it doesn't exist
- Update the password hash if it exists
- Use credentials: `admin` / `admin123`

### 4. Wrong Password Hash

**Symptom:** Login fails even with correct password

**Solution:**
The password hash in the database might be incorrect. Run:
```sh
npm run setup:admin
```

This will regenerate the correct bcrypt hash for `admin123`.

### 5. Environment Variables Not Set

**Symptom:** Connection errors or "Cannot connect to database"

**Solution:**
1. Create a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=housesadda
   JWT_SECRET=your-secret-key-change-in-production
   PORT=3001
   ```

2. Make sure the values match your MySQL configuration

### 6. CORS Issues

**Symptom:** Network errors in browser console

**Solution:**
- Make sure the backend server is running on port 3001
- Check that `VITE_API_URL` in frontend matches backend URL
- Default is `http://localhost:3001/api`

### 7. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab:** Look for JavaScript errors
- **Network tab:** Check if API requests are being made
  - Look for requests to `/api/auth/login`
  - Check the response status and error messages

### 8. Check Backend Logs

Look at the terminal where the backend server is running:
- Connection errors
- Database query errors
- Authentication errors

### Quick Fix Steps

1. **Stop all servers** (Ctrl+C)

2. **Check MySQL is running:**
   ```sh
   # Windows
   net start MySQL
   
   # Mac/Linux
   sudo systemctl status mysql
   ```

3. **Set up admin user:**
   ```sh
   npm run setup:admin
   ```

4. **Start backend:**
   ```sh
   npm run dev:server
   ```

5. **In another terminal, start frontend:**
   ```sh
   npm run dev
   ```

6. **Try logging in:**
   - Username: `admin`
   - Password: `admin123`

### Still Not Working?

1. Check MySQL connection manually:
   ```sh
   mysql -u root -p -e "USE housesadda; SELECT * FROM admin_users;"
   ```

2. Verify the admin user exists and has a password hash

3. Check backend server logs for specific error messages

4. Verify `.env` file has correct database credentials

