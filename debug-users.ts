import { db } from "./server/db";
import { users } from "./shared/schema";

async function checkUsers() {
  try {
    console.log("🔍 Checking users in database...");
    const allUsers = await db.select().from(users);
    console.log("📊 Total users found:", allUsers.length);
    
    if (allUsers.length > 0) {
      console.log("👥 Users found:");
      allUsers.forEach(user => {
        console.log(`- ${user.username} (${user.email})`);
      });
    } else {
      console.log("❌ No users found in database");
    }
    
    // Try to find 'tom' specifically
    const tom = allUsers.find(u => u.username === 'tom');
    if (tom) {
      console.log("✅ User 'tom' found:", { username: tom.username, email: tom.email });
    } else {
      console.log("❌ User 'tom' not found");
    }
    
  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    process.exit(0);
  }
}

checkUsers();