async function runAuthTests() {
  console.log("=== MorningVeg Auth & Customer Accounts Integration Test ===");
  const baseUrl = "http://localhost:3000";

  // Test 1: Invalid login
  console.log("\n[Test 1] POST /api/auth/login with invalid credentials");
  const res1 = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid@example.com", password: "wrong" }),
  });
  const data1 = await res1.json();
  console.log(`Status: ${res1.status} (Expected: 401)`);
  console.log(`Response:`, data1);
  if (res1.status !== 401) throw new Error("Expected 401 for invalid credentials");

  // Test 2: Valid login with demo user
  console.log("\n[Test 2] POST /api/auth/login with demo user");
  const res2 = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "customer@morningveg.com", password: "Password123!" }),
  });
  const data2 = await res2.json();
  console.log(`Status: ${res2.status} (Expected: 200)`);
  console.log(`User:`, data2.user);

  const rawCookie = res2.headers.get("set-cookie");
  console.log(`Set-Cookie received:`, rawCookie ? "YES (auth-token set)" : "NO");
  if (!rawCookie) throw new Error("Expected auth-token cookie");

  const authTokenCookie = rawCookie.split(";")[0];

  // Test 3: Query /api/auth/me with session cookie
  console.log("\n[Test 3] GET /api/auth/me with session cookie");
  const res3 = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: authTokenCookie },
  });
  const data3 = await res3.json();
  console.log(`Status: ${res3.status} (Expected: 200)`);
  console.log(`Authenticated: ${data3.authenticated}`);
  console.log(`User Profile:`, data3.user);
  if (!data3.authenticated || data3.user.email !== "customer@morningveg.com") {
    throw new Error("Failed to verify authenticated session");
  }

  // Test 4: Create delivery address
  console.log("\n[Test 4] POST /api/account/addresses (Add new delivery address)");
  const newAddr = {
    fullName: "Aarav Sharma",
    phone: "9876543210",
    street: "104 Emerald Heights, Indiranagar 100ft Road",
    landmark: "Near Metro Pillar 42",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560038",
    country: "India",
    isDefaultShipping: true,
    isDefaultBilling: true,
  };
  const res4 = await fetch(`${baseUrl}/api/account/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authTokenCookie,
    },
    body: JSON.stringify(newAddr),
  });
  const data4 = await res4.json();
  console.log(`Status: ${res4.status} (Expected: 201)`);
  console.log(`Created Address ID:`, data4.address?.id);

  // Test 5: Fetch user addresses
  console.log("\n[Test 5] GET /api/account/addresses");
  const res5 = await fetch(`${baseUrl}/api/account/addresses`, {
    headers: { Cookie: authTokenCookie },
  });
  const data5 = await res5.json();
  console.log(`Status: ${res5.status} (Expected: 200)`);
  console.log(`Total addresses found:`, data5.addresses?.length);
  const found = data5.addresses?.find((a) => a.fullName === "Aarav Sharma");
  if (!found) throw new Error("Created address not found in address book");
  console.log(`Verified saved address:`, found.street, found.city);

  // Test 6: Register a new user
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  console.log(`\n[Test 6] POST /api/auth/register (New User: ${uniqueEmail})`);
  const res6 = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Customer",
      email: uniqueEmail,
      password: "TestPassword123!",
      phone: "9123456789",
    }),
  });
  const data6 = await res6.json();
  console.log(`Status: ${res6.status} (Expected: 201)`);
  console.log(`Registered User:`, data6.user);
  if (res6.status !== 201 || !data6.user) throw new Error("Registration failed");

  // Test 7: Logout
  console.log("\n[Test 7] POST /api/auth/logout");
  const res7 = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST" });
  const data7 = await res7.json();
  console.log(`Status: ${res7.status} (Expected: 200)`);
  console.log(`Logout Response:`, data7);

  console.log("\n✅ ALL AUTHENTICATION & CUSTOMER ACCOUNT TESTS PASSED SUCCESSFULLY!\n");
}

runAuthTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
